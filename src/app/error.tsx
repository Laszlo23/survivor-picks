"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neon-gold/20 bg-neon-gold/5">
          <span className="font-mono text-3xl font-bold text-neon-gold">333</span>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-neon-gold/10 blur-xl" />
      </div>

      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neon-gold/60 mb-3">
        ERROR &bull; TECHNICAL DIFFICULTIES
      </p>

      <h1 className="font-headline text-3xl font-bold uppercase tracking-wide text-white mb-2">
        Signal Lost
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        Something went wrong on our end. The broadcast crew is on it.
      </p>
      <p className="text-xs text-neon-gold/50 font-mono mb-8">
        Don&apos;t worry — your $PICKS are safe &bull; The 333 continues
        {error.digest && (
          <span className="block mt-1 text-white/20">
            ref: {error.digest}
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-neon-cyan px-5 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider text-studio-black shadow-neon-cyan transition-all hover:shadow-neon-cyan-lg hover:brightness-110"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider text-white/80 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
