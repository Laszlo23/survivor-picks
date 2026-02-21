import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side auth callback handler.
 * Handles:
 * - PKCE flow: ?code=xxx → exchangeCodeForSession
 * - Token hash flow: ?token_hash=xxx&type=email → verifyOtp
 * - Hash fragment flow: no params → redirect to client page for hash processing
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") || "/dashboard";
  const origin = url.origin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.redirect(new URL("/auth/signin?error=config", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a read-only context
        }
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] Code exchange error:", error.message);
      return Response.redirect(new URL("/auth/signin?error=auth", origin));
    }
    return Response.redirect(new URL(next, origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email",
    });
    if (error) {
      console.error("[auth/callback] Token hash error:", error.message);
      return Response.redirect(new URL("/auth/signin?error=auth", origin));
    }
    return Response.redirect(new URL(next, origin));
  }

  // No code or token_hash — tokens might be in URL hash fragment (implicit flow).
  // Hash fragments aren't sent to the server, so redirect to a client page.
  const confirmUrl = new URL("/auth/callback/confirm", origin);
  confirmUrl.searchParams.set("next", next);
  return Response.redirect(confirmUrl);
}
