"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Client-side fallback for implicit flow (hash fragment tokens).
 * The server route handler redirects here when no code/token_hash is present.
 * The Supabase browser client auto-detects #access_token=... on init.
 */
export default function AuthCallbackConfirmPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    let redirected = false;

    function doRedirect(path: string) {
      if (redirected) return;
      redirected = true;
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.location.href = path;
    }

    async function processHash() {
      const supabase = createClient();

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/dashboard";

      // Listen for SIGNED_IN (fires when hash is auto-processed by the browser client)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            setTimeout(() => doRedirect(next), 300);
          }
        }
      );

      // Check if session already exists (hash may have been processed already)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        subscription.unsubscribe();
        doRedirect(next);
        return;
      }

      // Wait for hash processing — give it up to 8 seconds
      await new Promise((r) => setTimeout(r, 8000));

      if (!redirected) {
        // Final check
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        subscription.unsubscribe();
        if (finalSession) {
          doRedirect(next);
        } else {
          setError(true);
          doRedirect("/auth/signin?error=auth");
        }
      }
    }

    processHash();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        {!error ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
            <p className="text-sm">Signing you in…</p>
          </>
        ) : (
          <p className="text-sm">Something went wrong. Redirecting…</p>
        )}
      </div>
    </div>
  );
}
