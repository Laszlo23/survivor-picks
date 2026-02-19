import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listLiveSessions } from "@/lib/actions/live-sessions";
import { AdminLiveClient } from "./admin-live-client";

export const dynamic = "force-dynamic";

export default async function AdminLivePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch sessions and episodes for the selector
  const [sessions, episodes] = await Promise.all([
    listLiveSessions(),
    prisma.episode.findMany({
      where: {
        status: { in: ["OPEN", "LOCKED"] },
      },
      include: {
        season: { select: { title: true, showSlug: true } },
      },
      orderBy: { airAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <AdminLiveClient
      sessions={JSON.parse(JSON.stringify(sessions))}
      episodes={JSON.parse(JSON.stringify(episodes))}
    />
  );
}
