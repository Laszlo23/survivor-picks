import { getSession } from "@/lib/auth";
import { placeLiveBet, createLiveBetManual } from "@/lib/actions/live-bets";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const userSession = await getSession();
  if (!userSession?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case "place": {
        const result = await placeLiveBet({
          liveBetId: body.liveBetId,
          chosenOption: body.chosenOption,
          stakeAmount: body.stakeAmount || "0",
          txHash: body.txHash,
        });
        return Response.json(result);
      }

      case "create": {
        // Admin only — requireAdmin is checked inside
        const bet = await createLiveBetManual({
          sessionId: body.sessionId,
          prompt: body.prompt,
          category: body.category || "prop",
          options: body.options,
          windowSeconds: body.windowSeconds || 120,
          multiplier: body.multiplier,
        });
        return Response.json({ bet });
      }

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Operation failed" },
      { status: 500 }
    );
  }
}
