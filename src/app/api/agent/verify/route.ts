import { verifyAllPending, verifyEpisode } from "@/lib/agent/verify";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import { heavyLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ─── Auth ────────────────────────────────────────────────────────────

async function isAuthorized(req: Request): Promise<boolean> {
  // Check API key (cron / external callers)
  const key =
    req.headers.get("x-agent-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (key) {
    if (process.env.AGENT_SECRET_KEY && key === process.env.AGENT_SECRET_KEY) return true;
    if (process.env.CRON_SECRET && key === process.env.CRON_SECRET) return true;
  }

  // Check admin session (admin panel calls include session cookies)
  try {
    const session = await getSession();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (user?.role === "ADMIN") return true;
    }
  } catch {
    // Session check failed — fall through
  }

  return false;
}

// ─── GET: Cron-triggered verification ────────────────────────────────

export async function GET(req: Request) {
  const ip = getClientIP(req);
  const rl = heavyLimiter.check(`agent-ver:${ip}`);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

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
  const ipPost = getClientIP(req);
  const rlPost = heavyLimiter.check(`agent-ver:${ipPost}`);
  if (!rlPost.success) return rateLimitResponse(rlPost.resetAt);

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
