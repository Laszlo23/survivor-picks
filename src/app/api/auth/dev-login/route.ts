import { prisma } from "@/lib/prisma";

/**
 * DEV-ONLY: Instant login without email verification.
 * Sets a cookie that getCurrentUser reads. Blocked in production.
 */
export async function POST(req: Request) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DISABLE_DEV_LOGIN === "true"
  ) {
    return new Response(JSON.stringify({ error: "Not available" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: {
        email,
        name: name || email.split("@")[0],
        role: "USER",
        emailVerified: new Date(),
      },
    });

    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const cookie = `rp-auth-user-id=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Dev login error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create dev session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
