import { prisma } from "@/lib/prisma";
import { captureFrame } from "@/lib/ai/frame-capture";
import { analyzeFrame, type AnalysisResult } from "@/lib/ai/live-analyzer";
import { publishNewBet, publishFlashBet, publishBetResolved } from "@/lib/realtime/ably";
import { resolveLiveBet } from "@/lib/actions/live-bets";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  // Verify cron secret or admin token
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all active live sessions
    const sessions = await prisma.liveSession.findMany({
      where: { status: "live" },
      include: {
        episode: {
          include: {
            season: {
              include: {
                contestants: { where: { status: "ACTIVE" } },
                tribes: true,
              },
            },
          },
        },
        bets: {
          where: { status: { in: ["open", "locked"] } },
          select: { id: true, prompt: true, options: true, category: true },
        },
      },
    });

    if (sessions.length === 0) {
      return Response.json({ message: "No active live sessions", analyzed: 0 });
    }

    const results: Array<{
      sessionId: string;
      betsCreated: number;
      betsResolved: number;
    }> = [];

    for (const session of sessions) {
      // 1. Capture frame
      const frame = await captureFrame(session.streamUrl, session.streamType);
      if (!frame) {
        results.push({ sessionId: session.id, betsCreated: 0, betsResolved: 0 });
        continue;
      }

      // 2. Run Gemini analysis
      const context = {
        showTitle: session.episode.season.title,
        episodeNumber: session.episode.number,
        episodeTitle: session.episode.title,
        contestants: session.episode.season.contestants.map((c) => c.name),
        tribes: session.episode.season.tribes.map((t) => t.name),
        activeBets: session.bets.map((b) => ({
          id: b.id,
          prompt: b.prompt,
          options: b.options as string[],
          category: b.category,
        })),
      };

      let analysis: AnalysisResult;
      try {
        analysis = await analyzeFrame(frame.base64, frame.mimeType, context);
      } catch (err) {
        console.error(`[AI] Analysis failed for session ${session.id}:`, err);
        continue;
      }

      // 3. Save frame + analysis to DB
      await prisma.aIFrame.create({
        data: {
          sessionId: session.id,
          frameUrl: frame.source,
          analysis: analysis as any,
          events: analysis.detectedEvents as any,
        },
      });

      let betsCreated = 0;
      let betsResolved = 0;

      // 4. Create bets from AI suggestions (confidence > 0.7)
      for (const suggestion of analysis.betSuggestions) {
        if (suggestion.confidence < 0.7) continue;

        const now = new Date();
        const locksAt = new Date(
          now.getTime() + suggestion.windowSeconds * 1000
        );

        const bet = await prisma.liveBet.create({
          data: {
            sessionId: session.id,
            prompt: suggestion.prompt,
            category: suggestion.category,
            options: suggestion.options,
            odds: suggestion.suggestedOdds || {},
            status: "open",
            opensAt: now,
            locksAt,
            aiConfidence: suggestion.confidence,
            multiplier: suggestion.multiplier || 1,
          },
        });

        const betData = {
          id: bet.id,
          prompt: bet.prompt,
          category: bet.category,
          options: suggestion.options,
          odds: suggestion.suggestedOdds || {},
          status: "open",
          correctOption: null,
          opensAt: now.toISOString(),
          locksAt: locksAt.toISOString(),
          resolvedAt: null,
          multiplier: bet.multiplier,
          totalPool: "0",
          placements: [],
        };

        // Flash bets get special alert
        if (suggestion.category === "flash") {
          await publishFlashBet(session.id, betData);
        } else {
          await publishNewBet(session.id, betData);
        }

        betsCreated++;
      }

      // 5. Resolve bets from AI (confidence > 0.85)
      for (const resolution of analysis.betResolutions) {
        if (resolution.confidence < 0.85) continue;

        try {
          await resolveLiveBet(
            resolution.betId,
            resolution.correctOption,
            session.id
          );
          betsResolved++;
        } catch (err) {
          console.error(
            `[AI] Failed to resolve bet ${resolution.betId}:`,
            err
          );
        }
      }

      results.push({
        sessionId: session.id,
        betsCreated,
        betsResolved,
      });
    }

    return Response.json({
      message: "Analysis complete",
      analyzed: results.length,
      results,
    });
  } catch (err) {
    console.error("[AI] Analysis cron error:", err);
    return Response.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
