"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Auth callback page — handles magic link redirect from Supabase.
 * Supports both:
 * - PKCE flow: ?token_hash=...&type=email (requires verifyOtp)
 * - Implicit flow: #access_token=... (getSession auto-processes)
 */
export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    function redirectTo(path: string) {
      window.location.href = path;
    }

    function clearUrlAndRedirect(target: string) {
      if (typeof window !== "undefined" && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      setStatus("success");
      setTimeout(() => redirectTo(target), 600);
    }

    async function handleCallback() {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/profile";
      const target = next.startsWith("/") ? next : `/${next}`;

      // PKCE flow: token_hash in query params — must call verifyOtp
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type === "email") {
        const { data: { session }, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "email",
        });
        if (!mounted) return;
        if (error) {
          setStatus("error");
          redirectTo("/auth/signin?error=auth");
          return;
        }
        if (session) {
          clearUrlAndRedirect(target);
          return;
        }
      }

      // Implicit flow: hash with access_token — getSession processes it
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

      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setStatus("error");
        redirectTo("/auth/signin?error=auth");
        return;
      }

      if (session) {
        clearUrlAndRedirect(target);
        return;
      }

      const gotSignedIn = await signedInPromise;
      if (!mounted) return;
      if (gotSignedIn) {
        clearUrlAndRedirect(target);
        return;
      }

      const hasHash = typeof window !== "undefined" && window.location.hash?.length > 0;
      if (hasHash) {
        await new Promise((r) => setTimeout(r, 800));
        const { data: { session: retry } } = await supabase.auth.getSession();
        if (mounted && retry) {
          clearUrlAndRedirect(target);
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
