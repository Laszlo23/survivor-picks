/**
 * Question Generation Agent
 *
 * Searches the web for upcoming episode trends, previews, and fan
 * predictions, then generates draft prediction questions via LLM.
 */

import { prisma } from "@/lib/prisma";
import { searchMultiple } from "./search";
import { generateQuestions, type GeneratedQuestion } from "./llm";
import { getShowConfig } from "./shows";

// ─── Types ───────────────────────────────────────────────────────────

export interface GenerateResult {
  episodeId: string;
  episodeTitle: string;
  status: "generated" | "no_context" | "already_has_questions" | "error";
  questions: GeneratedQuestion[];
  message: string;
}

// ─── Main Generation Flow ────────────────────────────────────────────

/**
 * Generate questions for all upcoming DRAFT episodes.
 * Returns a report for each processed episode.
 */
export async function generateForAllDraft(): Promise<GenerateResult[]> {
  const now = new Date();

  // Find draft episodes that haven't aired yet
  const episodes = await prisma.episode.findMany({
    where: {
      status: "DRAFT",
      airAt: { gt: now },
    },
    include: {
      questions: true,
      season: {
        select: {
          id: true,
          title: true,
          showSlug: true,
        },
      },
    },
    orderBy: { airAt: "asc" },
    take: 5, // Max 5 episodes at a time to control cost
  });

  if (episodes.length === 0) {
    return [];
  }

  const results: GenerateResult[] = [];

  for (const episode of episodes) {
    try {
      const result = await generateForEpisode(episode);
      results.push(result);
    } catch (error: any) {
      results.push({
        episodeId: episode.id,
        episodeTitle: episode.title,
        status: "error",
        questions: [],
        message: error.message || "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Generate questions for a single episode.
 */
export async function generateForEpisode(episode: {
  id: string;
  title: string;
  number: number;
  questions: { id: string }[];
  season: { id: string; title: string; showSlug: string | null };
}): Promise<GenerateResult> {
  // Skip if episode already has questions
  if (episode.questions.length > 0) {
    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      status: "already_has_questions",
      questions: [],
      message: `Episode already has ${episode.questions.length} questions`,
    };
  }

  // Get show config
  const showConfig = episode.season.showSlug
    ? getShowConfig(episode.season.showSlug)
    : null;

  // Fetch current contestants
  const contestants = await prisma.contestant.findMany({
    where: { seasonId: episode.season.id },
    include: { tribe: true },
    orderBy: { name: "asc" },
  });

  // Fetch tribe names
  const tribes = await prisma.tribe.findMany({
    where: { seasonId: episode.season.id },
    select: { name: true },
  });

  // Build search queries for trends and previews
  const searchTerms = showConfig?.searchTerms || [episode.season.title];
  const queries = [
    `${searchTerms[0]} Episode ${episode.number} preview predictions`,
    `${searchTerms[0]} Episode ${episode.number} spoilers what to expect`,
    `${searchTerms[0]} upcoming episode analysis odds`,
  ];

  // Search for trends
  const searchResponse = await searchMultiple(queries, {
    maxResults: 6,
  });

  const trendContent =
    searchResponse.results.length > 0
      ? searchResponse.results
          .map((r) => `[${r.title}](${r.url})\n${r.content}`)
          .join("\n\n---\n\n")
      : "";

  // Build episode context
  const eliminatedContestants = contestants
    .filter((c) => c.status === "ELIMINATED")
    .map((c) => c.name);

  const episodeContext = `Show: ${episode.season.title}
Episode ${episode.number}: ${episode.title}
Active contestants: ${contestants.filter((c) => c.status === "ACTIVE").length}
Eliminated so far: ${eliminatedContestants.length > 0 ? eliminatedContestants.join(", ") : "None yet"}
${showConfig ? `Show format: ${showConfig.rulesContext}` : ""}`;

  // Generate questions via LLM
  const generatedQuestions = await generateQuestions(
    showConfig?.rulesContext || episode.season.title,
    episodeContext,
    contestants.map((c) => ({
      name: c.name,
      status: c.status,
      tribe: c.tribe?.name,
    })),
    tribes.map((t) => t.name),
    trendContent,
    4 // Generate 4 questions per episode
  );

  if (generatedQuestions.length === 0) {
    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      status: "no_context",
      questions: [],
      message: "LLM did not generate any questions",
    };
  }

  // Save questions as DRAFT in the database
  for (let i = 0; i < generatedQuestions.length; i++) {
    const q = generatedQuestions[i];

    // Validate question type
    const validTypes = [
      "CHALLENGE_WINNER",
      "ELIMINATION",
      "TWIST",
      "TRIBAL_COUNCIL",
      "IMMUNITY",
      "REWARD",
      "CUSTOM",
    ];
    const type = validTypes.includes(q.type) ? q.type : "CUSTOM";

    await prisma.question.create({
      data: {
        episodeId: episode.id,
        type: type as any,
        prompt: q.prompt,
        odds: q.suggestedOdds,
        options: q.options,
        status: "DRAFT",
        sortOrder: i,
      },
    });
  }

  return {
    episodeId: episode.id,
    episodeTitle: episode.title,
    status: "generated",
    questions: generatedQuestions,
    message: `Generated ${generatedQuestions.length} draft questions`,
  };
}
