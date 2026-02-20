import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative">
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-neon-gold/20 bg-neon-gold/5">
            <span className="font-mono text-4xl font-bold text-neon-gold">333</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-neon-gold/10 blur-xl" />
        </div>

        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-neon-cyan/60 mb-3">
          ERROR 404
        </p>

        <h1 className="font-headline text-4xl font-extrabold uppercase tracking-wide text-white mb-3 sm:text-5xl">
          Channel Not Found
        </h1>

        <p className="text-sm text-muted-foreground max-w-md mb-2">
          This broadcast doesn&apos;t exist or has been taken off the air.
        </p>
        <p className="text-xs text-neon-gold/50 font-mono mb-8">
          Head back to the main stage &bull; Your $PICKS are waiting
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-neon-cyan px-6 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider text-studio-black shadow-neon-cyan transition-all hover:shadow-neon-cyan-lg hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider text-white/80 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all"
          >
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
