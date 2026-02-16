import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { heavyLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = getClientIP(req);
  const rl = heavyLimiter.check(`admin-logs:${ip}`);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

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
  } catch (error: unknown) {
    console.error("Agent logs error:", error);
    return Response.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
