import Ably from "ably";

// ─── Server-side Ably client (publish-only) ──────────────────────────────────

let _serverClient: Ably.Rest | null = null;

export function getAblyServer(): Ably.Rest {
  if (!_serverClient) {
    const key = process.env.ABLY_API_KEY;
    if (!key) throw new Error("ABLY_API_KEY is not set");
    _serverClient = new Ably.Rest({ key });
  }
  return _serverClient;
}

// ─── Channel helpers ─────────────────────────────────────────────────────────

/** Publish an event to a live session channel */
export async function publishToSession(
  sessionId: string,
  event: string,
  data: unknown
) {
  const ably = getAblyServer();
  const channel = ably.channels.get(`live:${sessionId}`);
  await channel.publish(event, data);
}

/** Publish odds update for a specific bet */
export async function publishOddsUpdate(
  sessionId: string,
  betId: string,
  odds: Record<string, number>,
  totalPool: string
) {
  await publishToSession(sessionId, "odds:update", {
    betId,
    odds,
    totalPool,
    timestamp: Date.now(),
  });
}

/** Publish new bet to session */
export async function publishNewBet(sessionId: string, bet: unknown) {
  await publishToSession(sessionId, "bet:new", bet);
}

/** Publish bet resolution */
export async function publishBetResolved(
  sessionId: string,
  betId: string,
  correctOption: string,
  payouts: Array<{ userId: string; amount: string }>
) {
  await publishToSession(sessionId, "bet:resolved", {
    betId,
    correctOption,
    payouts,
    timestamp: Date.now(),
  });
}

/** Publish flash bet alert */
export async function publishFlashBet(sessionId: string, bet: unknown) {
  await publishToSession(sessionId, "bet:flash", bet);
}

/** Publish viewer count update */
export async function publishViewerCount(
  sessionId: string,
  count: number
) {
  await publishToSession(sessionId, "viewers:count", { count });
}
