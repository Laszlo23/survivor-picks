"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
      </div>

      <h2 className="font-headline text-2xl font-bold uppercase tracking-wide text-white mb-2">
        Dashboard Error
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        We couldn&apos;t load your predictions. This might be a temporary issue.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-neon-cyan px-5 py-2.5 text-sm font-semibold text-studio-black shadow-neon-cyan transition-all hover:shadow-neon-cyan-lg"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm text-white/80 hover:text-neon-cyan transition-colors"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
