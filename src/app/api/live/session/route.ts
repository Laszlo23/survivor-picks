import { getSession } from "@/lib/auth";
import {
  createLiveSession,
  startLiveSession,
  pauseLiveSession,
  endLiveSession,
  getActiveLiveSession,
} from "@/lib/actions/live-sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getActiveLiveSession();
  if (!session) {
    return Response.json({ session: null });
  }
  return Response.json({ session });
}

export async function POST(req: Request) {
  const userSession = await getSession();
  if (userSession?.user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case "create": {
        const result = await createLiveSession({
          episodeId: body.episodeId,
          streamUrl: body.streamUrl,
          streamType: body.streamType || "youtube",
        });
        return Response.json({ session: result });
      }

      case "start": {
        const result = await startLiveSession(body.sessionId);
        return Response.json({ session: result });
      }

      case "pause": {
        const result = await pauseLiveSession(body.sessionId);
        return Response.json({ session: result });
      }

      case "end": {
        const result = await endLiveSession(body.sessionId);
        return Response.json({ session: result });
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
