import { NextRequest } from "next/server";
import { getBettingHistory } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rawFilter = url.searchParams.get("filter");
  const filter = rawFilter === "won" || rawFilter === "lost" || rawFilter === "pending" ? rawFilter : undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const result = await getBettingHistory(limit, offset, filter);

  const serialized = result.predictions.map((p) => ({
    id: p.id,
    chosenOption: p.chosenOption,
    isRisk: p.isRisk,
    usedJoker: p.usedJoker,
    pointsAwarded: p.pointsAwarded,
    isCorrect: p.isCorrect,
    createdAt: p.createdAt.toISOString(),
    question: {
      prompt: p.question.prompt,
      correctOption: p.question.correctOption,
      episode: {
        number: p.question.episode.number,
        title: p.question.episode.title,
        season: { title: p.question.episode.season.title },
      },
    },
  }));

  return Response.json({ predictions: serialized, total: result.total });
}
