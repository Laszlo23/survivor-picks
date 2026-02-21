import { createClient } from "@supabase/supabase-js";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("[magic-link] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
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

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

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
  const redirectTo = origin ? `${origin}/auth/callback` : "";

  try {
    const supabase = createClient(url, serviceKey);

    // Try magiclink first (existing user), fall back to signup (new user)
    let result = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    let otpType: "magiclink" | "signup" = "magiclink";

    if (result.error) {
      result = await supabase.auth.admin.generateLink({
        type: "signup",
        email,
        password: crypto.randomUUID(),
        options: { redirectTo },
      });
      otpType = "signup";
    }

    if (result.error) {
      console.error("[magic-link] generateLink failed:", result.error.message);
      return Response.json(
        { error: result.error.message || "Failed to generate sign-in link" },
        { status: 400 }
      );
    }

    const { email_otp, action_link } = result.data.properties;

    if (!email_otp) {
      console.error("[magic-link] No OTP returned from generateLink");
      return Response.json(
        { error: "Failed to generate verification code" },
        { status: 500 }
      );
    }

    await sendOtpEmail(email, email_otp, action_link);

    console.log("[magic-link] OTP email sent to", email, "| type:", otpType);
    return Response.json({ success: true, otpType });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[magic-link] Unexpected error:", msg);
    return Response.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
