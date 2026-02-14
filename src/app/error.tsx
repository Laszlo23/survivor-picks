"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl" />
      </div>

      <h1 className="font-headline text-3xl font-bold uppercase tracking-wide text-white mb-2">
        Technical Difficulties
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Something went wrong on our end. Our production crew is on it.
        {error.digest && (
          <span className="block mt-1 text-xs font-mono text-white/30">
            Error ID: {error.digest}
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-neon-cyan px-5 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider text-studio-black shadow-neon-cyan transition-all hover:shadow-neon-cyan-lg hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
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
