/**
 * Captures a referral code from ?ref=CODE and stores it in a cookie.
 * Called client-side when the landing page detects a ref param.
 */
export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.length !== 8) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `ref_code=${code}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`, // 7 days
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
