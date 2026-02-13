import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminSeasons, getAdminStats } from "@/lib/actions/admin";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [seasons, stats] = await Promise.all([
    getAdminSeasons(),
    getAdminStats(),
  ]);

  return <AdminClient seasons={seasons} stats={stats} />;
}
