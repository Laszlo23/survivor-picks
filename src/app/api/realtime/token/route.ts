import Ably from "ably";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Ably not configured" }, { status: 500 });
  }

  const ably = new Ably.Rest({ key: apiKey });

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.user.id,
    capability: {
      "live:*": ["subscribe", "presence", "history"],
    },
  });

  return Response.json(tokenRequest);
}
