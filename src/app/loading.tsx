export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 animate-pulse">
          <span className="font-mono text-xl font-bold text-neon-cyan">333</span>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-neon-cyan/10 blur-xl animate-pulse" />
      </div>
      <p className="mt-4 text-xs text-muted-foreground font-mono uppercase tracking-[0.2em] animate-pulse">
        Loading broadcast...
      </p>
    </div>
  );
}
