/**
 * Captures a referral code from ?ref=CODE and stores it in a cookie.
 * Called client-side when the landing page detects a ref param.
 */

// Strict alphanumeric pattern matching the code generator charset
const REFERRAL_CODE_REGEX = /^[A-HJ-NP-Z2-9]{8}$/;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || !REFERRAL_CODE_REGEX.test(code)) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine if we should use Secure flag (production over HTTPS)
    const isSecure =
      process.env.NODE_ENV === "production" ||
      process.env.NEXTAUTH_URL?.startsWith("https://");
    const securePart = isSecure ? " Secure;" : "";

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `ref_code=${code}; Path=/; HttpOnly; SameSite=Lax;${securePart} Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
