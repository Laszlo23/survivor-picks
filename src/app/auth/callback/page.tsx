"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Auth callback page — handles magic link redirect from Supabase.
 * Supabase redirects with tokens in the URL hash (#access_token=...).
 * The hash is client-only; the server never sees it.
 * The Supabase browser client auto-processes the hash on init and saves the session to cookies.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/dashboard";

      // Supabase client auto-processes hash (#access_token=...) on init.
      // Wait for init, then check session.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setStatus("error");
        router.replace(`/auth/signin?error=auth`);
        return;
      }

      if (session) {
        setStatus("success");
        router.replace(next.startsWith("/") ? next : `/${next}`);
        return;
      }

      // No session — hash may still be processing. Supabase client processes hash on init.
      const hasHash = typeof window !== "undefined" && window.location.hash?.length > 0;
      if (hasHash) {
        await new Promise((r) => setTimeout(r, 300));
        const { data: { session: retry } } = await supabase.auth.getSession();
        if (mounted && retry) {
          setStatus("success");
          router.replace(next.startsWith("/") ? next : `/${next}`);
          return;
        }
      }

      setStatus("error");
      router.replace("/auth/signin?error=auth");
    }

    handleCallback();
    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
            <p className="text-sm">Signing you in…</p>
          </>
        )}
        {status === "error" && (
          <p className="text-sm">Redirecting to sign in…</p>
        )}
      </div>
    </div>
  );
}
