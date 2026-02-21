"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Status = "processing" | "success" | "error";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function handleAuth() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");
      const next = url.searchParams.get("next") || "/dashboard";

      // --- Strategy 1: PKCE code exchange ---
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          return finish(next);
        }
        console.error("[auth/callback] Code exchange failed:", error.message);
      }

      // --- Strategy 2: Token hash verification (email template flow) ---
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type as "email" | "magiclink") || "email",
        });
        if (!error) {
          return finish(next);
        }
        console.error("[auth/callback] Token hash verify failed:", error.message);
      }

      // --- Strategy 3: Manual hash fragment parsing ---
      if (window.location.hash && window.location.hash.length > 1) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            window.location.hash = "";
            return finish(next);
          }
          console.error("[auth/callback] setSession failed:", error.message);
        }
      }

      // --- Strategy 4: Check if session was auto-detected by createBrowserClient ---
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return finish(next);
      }

      // --- Strategy 5: Poll for session (auto-detection may be async) ---
      for (let attempt = 0; attempt < 8; attempt++) {
        await sleep(750);
        if (cancelled) return;
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          return finish(next);
        }
      }

      // All strategies failed
      if (!cancelled) {
        setStatus("error");
        setMessage("Could not complete sign in. Redirecting…");
        await sleep(2000);
        window.location.href = "/auth/signin?error=callback_failed";
      }
    }

    function finish(destination: string) {
      if (cancelled) return;
      setStatus("success");
      setMessage("You're in! Redirecting…");
      setTimeout(() => {
        if (!cancelled) window.location.href = destination;
      }, 600);
    }

    handleAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const icon =
    status === "success" ? (
      <CheckCircle className="h-8 w-8 text-neon-cyan" />
    ) : status === "error" ? (
      <XCircle className="h-8 w-8 text-red-400" />
    ) : (
      <Loader2 className="h-8 w-8 text-neon-cyan animate-spin" />
    );

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {icon}
        <p className="text-lg font-medium text-white">{message}</p>
        {status === "processing" && (
          <p className="text-sm text-muted-foreground">
            Please wait — this should only take a moment.
          </p>
        )}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
