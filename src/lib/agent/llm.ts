/**
 * LLM Wrapper — OpenAI GPT-4o with Structured Outputs
 *
 * Provides typed, JSON-schema-constrained outputs for:
 * - Result verification (extract correct answers from web content)
 * - Question generation (create prediction questions from trends)
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface VerificationResult {
  questionId: string;
  correctOption: string; // must match one of the provided options exactly
  confidence: number; // 0.0-1.0
  source: string; // URL or description of where the answer was found
  reasoning: string; // brief explanation
}

export interface GeneratedQuestion {
  type: string; // QuestionType
  prompt: string;
  options: string[];
  suggestedOdds: number; // American odds
  reasoning: string; // why this question is interesting
}

// ─── OpenAI Call ─────────────────────────────────────────────────────

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const {
    model = "gpt-4o",
    temperature = 0.1,
    maxTokens = 4000,
  } = options;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "{}";
}

// ─── Verification Extraction ─────────────────────────────────────────

/**
 * Given web search results and a list of questions, extract the correct
 * answers with confidence scores.
 */
export async function extractVerificationResults(
  searchContent: string,
  questions: {
    id: string;
    prompt: string;
    options: string[];
  }[],
  showContext: string
): Promise<VerificationResult[]> {
  const systemPrompt = `You are a TV show result verification agent. Your job is to determine the correct answers to prediction questions based on web search results about aired episodes.

RULES:
1. You MUST return one of the EXACT options provided for each question. Do not modify or paraphrase.
2. Set confidence between 0.0 and 1.0:
   - 0.95-1.0: Multiple reliable sources confirm the same answer
   - 0.8-0.94: One reliable source confirms, no contradictions
   - 0.5-0.79: Some evidence but not definitive
   - 0.0-0.49: Insufficient evidence or conflicting information
3. If you cannot determine the answer, set confidence to 0.0 and correctOption to the first option.
4. Always cite your source.

Show context: ${showContext}

Respond with JSON: { "results": [{ "questionId": string, "correctOption": string, "confidence": number, "source": string, "reasoning": string }] }`;

  const questionsText = questions
    .map(
      (q) =>
        `Question ID: ${q.id}\nQuestion: ${q.prompt}\nOptions: ${q.options.map((o, i) => `${i + 1}. ${o}`).join(", ")}`
    )
    .join("\n\n");

  const userPrompt = `Based on the following web search results, determine the correct answers for each question.

WEB SEARCH RESULTS:
${searchContent}

QUESTIONS TO VERIFY:
${questionsText}`;

  const raw = await callOpenAI(systemPrompt, userPrompt);

  try {
    const parsed = JSON.parse(raw);
    const results: VerificationResult[] = (parsed.results || []).map((r: any) => ({
      questionId: r.questionId || "",
      correctOption: r.correctOption || "",
      confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0)),
      source: r.source || "unknown",
      reasoning: r.reasoning || "",
    }));

    // Validate: correctOption must be in the question's options
    for (const result of results) {
      const question = questions.find((q) => q.id === result.questionId);
      if (question && !question.options.includes(result.correctOption)) {
        // Try case-insensitive match
        const match = question.options.find(
          (o) => o.toLowerCase() === result.correctOption.toLowerCase()
        );
        if (match) {
          result.correctOption = match;
        } else {
          result.confidence = 0;
          result.reasoning += " [WARN: answer not in options, confidence set to 0]";
        }
      }
    }

    return results;
  } catch {
    console.error("Failed to parse LLM verification response:", raw);
    return questions.map((q) => ({
      questionId: q.id,
      correctOption: q.options[0],
      confidence: 0,
      source: "parse_error",
      reasoning: "Failed to parse LLM response",
    }));
  }
}

// ─── Question Generation ─────────────────────────────────────────────

/**
 * Generate prediction questions for an upcoming episode based on
 * show context, contestant info, and web search trends.
 */
export async function generateQuestions(
  showContext: string,
  episodeContext: string,
  contestants: { name: string; status: string; tribe?: string }[],
  tribes: string[],
  trendContent: string,
  count: number = 4
): Promise<GeneratedQuestion[]> {
  const systemPrompt = `You are a prediction question generator for a TV show prediction game. Create engaging, varied questions that fans would enjoy predicting.

RULES:
1. Generate exactly ${count} questions.
2. Use these question types: CHALLENGE_WINNER, ELIMINATION, TWIST, TRIBAL_COUNCIL, IMMUNITY, REWARD, CUSTOM
3. Each question must have 2-8 options.
4. For contestant-based questions, ONLY use active contestants: ${contestants.filter((c) => c.status === "ACTIVE").map((c) => c.name).join(", ")}
5. For tribe-based questions, use: ${tribes.join(", ")}
6. Suggest American odds (-200 to +500):
   - Negative odds (e.g., -150) = likely outcome
   - Positive odds (e.g., +300) = unlikely outcome
7. Make at least one question a twist/surprise question.
8. Vary the difficulty — mix easy and hard predictions.

Show context: ${showContext}

Respond with JSON: { "questions": [{ "type": string, "prompt": string, "options": string[], "suggestedOdds": number, "reasoning": string }] }`;

  const userPrompt = `Generate ${count} prediction questions for this upcoming episode.

EPISODE CONTEXT:
${episodeContext}

CURRENT CONTESTANTS:
${contestants
  .filter((c) => c.status === "ACTIVE")
  .map((c) => `- ${c.name}${c.tribe ? ` (${c.tribe})` : ""}`)
  .join("\n")}

RECENT TRENDS & PREVIEWS:
${trendContent || "No specific trends available. Generate general questions based on show format."}`;

  const raw = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.7 });

  try {
    const parsed = JSON.parse(raw);
    return (parsed.questions || []).map((q: any) => ({
      type: q.type || "CUSTOM",
      prompt: q.prompt || "",
      options: Array.isArray(q.options) ? q.options : [],
      suggestedOdds: Number(q.suggestedOdds) || 100,
      reasoning: q.reasoning || "",
    }));
  } catch {
    console.error("Failed to parse LLM generation response:", raw);
    return [];
  }
}
