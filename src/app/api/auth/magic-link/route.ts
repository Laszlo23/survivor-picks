import { createClient } from "@supabase/supabase-js";

/**
 * Same-origin proxy for Supabase magic link.
 * Client calls this instead of Supabase directly to avoid "Failed to fetch"
 * (CORS, ad blockers, missing client env vars).
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("[magic-link] Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    return Response.json(
      { error: "Auth not configured. Please contact support." },
      { status: 503 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  // Use Origin header for redirect (matches user's current domain) or fallback to env
  let origin = request.headers.get("origin");
  if (!origin) {
    try {
      const referer = request.headers.get("referer");
      origin = referer ? new URL(referer).origin : null;
    } catch {
      origin = null;
    }
  }
  origin = origin || process.env.NEXT_PUBLIC_APP_URL || "";
  const redirectTo = origin ? new URL("/auth/callback", origin).href : "";

  if (!redirectTo) {
    console.error("[magic-link] Could not determine redirect URL. Set NEXT_PUBLIC_APP_URL (e.g. https://www.realitypicks.xyz)");
    return Response.json(
      { error: "Redirect URL not configured. Please contact support." },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error("[magic-link] Supabase error:", error.message, "| code:", error.status);
      return Response.json(
        { error: error.message || "Failed to send magic link" },
        { status: 400 }
      );
    }

    console.log("[magic-link] Sent to", email, "| redirect:", redirectTo);
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[magic-link] Unexpected error:", msg);
    return Response.json(
      { error: "Server error. Please try again or contact support." },
      { status: 500 }
    );
  }
}
