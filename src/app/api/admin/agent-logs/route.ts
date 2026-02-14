import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const logs = await prisma.agentLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return Response.json({ logs });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
