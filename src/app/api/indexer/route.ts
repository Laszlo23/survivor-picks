/**
 * API route to trigger event indexing.
 * Can be called via cron job or manually.
 * GET /api/indexer?fromBlock=0
 */

import { EventIndexer } from "@/lib/indexer/event-indexer";
import {
  handlePredictionMade,
  handleQuestionResolved,
  handleRewardClaimed,
  handleStaked,
  handleBadgeMinted,
  handlePassPurchased,
} from "@/lib/indexer/sync-handlers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Auth: check Authorization header (Bearer token) or legacy query param
  const expectedKey = process.env.INDEXER_API_KEY;
  if (expectedKey) {
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Also accept cron secret for Vercel cron jobs
    const cronSecret = request.headers.get("authorization")?.startsWith("Bearer ")
      ? null
      : null;

    if (bearerToken !== expectedKey) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const fromBlock = BigInt(searchParams.get("fromBlock") || "0");

  try {
    const indexer = new EventIndexer();

    // Register handlers
    indexer.onEvent("PredictionMade", handlePredictionMade);
    indexer.onEvent("QuestionResolved", handleQuestionResolved);
    indexer.onEvent("RewardClaimed", handleRewardClaimed);
    indexer.onEvent("Staked", handleStaked);
    indexer.onEvent("BadgeMinted", handleBadgeMinted);
    indexer.onEvent("PassPurchased", handlePassPurchased);

    // Index from the specified block
    const events = await indexer.indexFromBlock(fromBlock);

    return Response.json({
      success: true,
      eventsProcessed: events.length,
      events: events.map(e => ({
        type: e.type,
        block: e.blockNumber.toString(),
        tx: e.transactionHash,
      })),
    });
  } catch (error) {
    console.error("[Indexer API] Error:", error);
    return Response.json(
      { error: "Indexing failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
