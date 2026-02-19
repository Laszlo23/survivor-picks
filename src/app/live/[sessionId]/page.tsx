import { notFound, redirect } from "next/navigation";
import { getLiveSession } from "@/lib/actions/live-sessions";
import { getSession } from "@/lib/auth";
import { LiveSessionClient } from "./live-session-client";

export const dynamic = "force-dynamic";

export default async function LivePage({
  params,
}: {
  params: { sessionId: string };
}) {
  const [session, userSession] = await Promise.all([
    getLiveSession(params.sessionId),
    getSession(),
  ]);

  if (!session) notFound();
  if (!userSession?.user) redirect("/auth/signin");

  return (
    <LiveSessionClient
      session={JSON.parse(JSON.stringify(session))}
      userId={userSession.user.id}
    />
  );
}
