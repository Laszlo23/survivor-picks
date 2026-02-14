import { generateForAllDraft, generateForEpisode } from "@/lib/agent/generate";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ─── Auth ────────────────────────────────────────────────────────────

async function isAuthorized(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const key =
    url.searchParams.get("key") ||
    req.headers.get("x-agent-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  // Allow cron / API key auth
  if (key && key === process.env.AGENT_SECRET_KEY) return true;

  // Allow Vercel Cron (uses CRON_SECRET env var)
  if (key && key === process.env.CRON_SECRET) return true;

  // Allow admin-triggered calls from the panel
  if (key === "admin-trigger") {
    try {
      const session = await getSession();
      if (!session?.user?.id) return false;
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      return user?.role === "ADMIN";
    } catch {
      return false;
    }
  }

  return false;
}

// ─── GET: Cron-triggered generation ──────────────────────────────────

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await generateForAllDraft();

    // Log each result
    for (const r of results) {
      await prisma.agentLog.create({
        data: {
          type: "generate",
          episodeId: r.episodeId,
          input: { episodeTitle: r.episodeTitle },
          output: {
            status: r.status,
            questionCount: r.questions.length,
            questions: r.questions.map((q) => ({
              type: q.type,
              prompt: q.prompt,
              optionCount: q.options.length,
            })),
            message: r.message,
          },
          confidence: null,
          status: r.status === "generated" ? "success" : r.status === "error" ? "failed" : "needs_review",
        },
      });
    }

    return Response.json({
      ok: true,
      processed: results.length,
      results: results.map((r) => ({
        episodeId: r.episodeId,
        episodeTitle: r.episodeTitle,
        status: r.status,
        questionCount: r.questions.length,
        message: r.message,
      })),
    });
  } catch (error: any) {
    console.error("Agent generate error:", error);
    return Response.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

// ─── POST: Manual single-episode generation ──────────────────────────

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { episodeId } = body;

    if (!episodeId) {
      return Response.json(
        { error: "episodeId is required" },
        { status: 400 }
      );
    }

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        questions: { select: { id: true } },
        season: {
          select: { id: true, title: true, showSlug: true },
        },
      },
    });

    if (!episode) {
      return Response.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    const result = await generateForEpisode(episode);

    // Log
    await prisma.agentLog.create({
      data: {
        type: "generate",
        seasonId: episode.season.id,
        episodeId: episode.id,
        input: { episodeTitle: episode.title, manual: true },
        output: {
          status: result.status,
          questionCount: result.questions.length,
          questions: result.questions.map((q) => ({
            type: q.type,
            prompt: q.prompt,
            optionCount: q.options.length,
          })),
          message: result.message,
        },
        confidence: null,
        status: result.status === "generated" ? "success" : result.status === "error" ? "failed" : "needs_review",
      },
    });

    return Response.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Agent generate error:", error);
    return Response.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
