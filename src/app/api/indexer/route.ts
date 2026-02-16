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
  // Auth: require INDEXER_API_KEY or CRON_SECRET — always enforced
  const expectedKey = process.env.INDEXER_API_KEY;
  const cronSecret = process.env.CRON_SECRET;

  if (!expectedKey && !cronSecret) {
    console.error("[Indexer API] Neither INDEXER_API_KEY nor CRON_SECRET is configured");
    return Response.json(
      { error: "Service unavailable — not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const isAuthorized =
    (expectedKey && bearerToken === expectedKey) ||
    (cronSecret && bearerToken === cronSecret);

  if (!isAuthorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let fromBlock: bigint;
  try {
    const raw = searchParams.get("fromBlock") || "0";
    if (!/^\d+$/.test(raw)) {
      return Response.json({ error: "Invalid fromBlock parameter" }, { status: 400 });
    }
    fromBlock = BigInt(raw);
  } catch {
    return Response.json({ error: "Invalid fromBlock parameter" }, { status: 400 });
  }

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
      mode: "audit",
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
      { error: "Indexing failed" },
      { status: 500 }
    );
  }
}
