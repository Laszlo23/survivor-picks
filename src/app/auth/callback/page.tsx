"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Auth callback page — handles magic link redirect from Supabase.
 * Supabase redirects with tokens in the URL hash (#access_token=...).
 * The hash is client-only; the server never sees it.
 * The Supabase browser client auto-processes the hash on init and saves the session to cookies.
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    function redirectTo(path: string) {
      // Full page navigation ensures cookies are sent; router.replace can race with cookie write
      window.location.href = path;
    }

    async function handleCallback() {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/dashboard";
      const target = next.startsWith("/") ? next : `/${next}`;

      // Subscribe to SIGNED_IN first (may fire during init), then trigger init via getSession
      const signedInPromise = new Promise<boolean>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN") {
            subscription.unsubscribe();
            resolve(true);
          }
        });
        setTimeout(() => {
          subscription.unsubscribe();
          resolve(false);
        }, 5000);
      });

      // getSession triggers client init, which processes hash and may fire SIGNED_IN
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setStatus("error");
        redirectTo("/auth/signin?error=auth");
        return;
      }

      if (session) {
        setStatus("success");
        await new Promise((r) => setTimeout(r, 150));
        redirectTo(target);
        return;
      }

      // No session yet — wait for SIGNED_IN (init may still be processing)
      const gotSignedIn = await signedInPromise;
      if (!mounted) return;

      if (gotSignedIn) {
        setStatus("success");
        await new Promise((r) => setTimeout(r, 150));
        redirectTo(target);
        return;
      }

      // Retry getSession in case of timing
      const hasHash = typeof window !== "undefined" && window.location.hash?.length > 0;
      if (hasHash) {
        await new Promise((r) => setTimeout(r, 500));
        const { data: { session: retry } } = await supabase.auth.getSession();
        if (mounted && retry) {
          setStatus("success");
          await new Promise((r) => setTimeout(r, 150));
          redirectTo(target);
          return;
        }
      }

      setStatus("error");
      redirectTo("/auth/signin?error=auth");
    }

    handleCallback();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

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
