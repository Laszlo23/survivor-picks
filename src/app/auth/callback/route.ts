import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = new URL(next.startsWith("/") ? next : `/${next}`, origin);
      return Response.redirect(redirectUrl.href);
    }
  }

  const signInUrl = new URL("/auth/signin", origin);
  signInUrl.searchParams.set("error", "auth");
  return Response.redirect(signInUrl.href);
}
