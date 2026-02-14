import { verifyAllPending, verifyEpisode } from "@/lib/agent/verify";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── Auth ────────────────────────────────────────────────────────────

async function isAuthorized(req: Request): Promise<boolean> {
  // Only accept auth via headers (not query params — prevents URL log leaks)
  const key =
    req.headers.get("x-agent-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!key) return false;

  // Allow cron / API key auth
  if (process.env.AGENT_SECRET_KEY && key === process.env.AGENT_SECRET_KEY) return true;

  // Allow Vercel Cron (sends Authorization: Bearer <CRON_SECRET>)
  if (process.env.CRON_SECRET && key === process.env.CRON_SECRET) return true;

  // Allow admin-triggered calls from the panel (requires valid admin session)
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

// ─── GET: Cron-triggered verification ────────────────────────────────

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await verifyAllPending();

    // Log each result
    for (const r of results) {
      await prisma.agentLog.create({
        data: {
          type: "verify",
          episodeId: r.episodeId,
          input: {
            episodeTitle: r.episodeTitle,
          },
          output: JSON.parse(JSON.stringify({
            status: r.status,
            results: r.results,
            averageConfidence: r.averageConfidence,
            message: r.message,
          })) as Prisma.InputJsonValue,
          confidence: r.averageConfidence,
          status: r.status === "auto_resolved" ? "success" : r.status === "error" ? "failed" : "needs_review",
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
        averageConfidence: r.averageConfidence,
        message: r.message,
      })),
    });
  } catch (error: unknown) {
    console.error("Agent verify error:", error);
    return Response.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

// ─── POST: Manual single-episode verification ───────────────────────

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
        questions: {
          where: { status: { not: "RESOLVED" } },
          select: { id: true, prompt: true, options: true, type: true },
        },
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

    const result = await verifyEpisode(episode);

    // Log
    await prisma.agentLog.create({
      data: {
        type: "verify",
        seasonId: episode.season.id,
        episodeId: episode.id,
        input: { episodeTitle: episode.title, manual: true },
        output: JSON.parse(JSON.stringify({
          status: result.status,
          results: result.results,
          averageConfidence: result.averageConfidence,
          message: result.message,
        })) as Prisma.InputJsonValue,
        confidence: result.averageConfidence,
        status: result.status === "auto_resolved" ? "success" : result.status === "error" ? "failed" : "needs_review",
      },
    });

    return Response.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error("Agent verify error:", error);
    return Response.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
