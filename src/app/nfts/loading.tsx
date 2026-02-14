export default function NFTsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 animate-pulse">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="h-8 w-64 bg-white/[0.04] rounded mx-auto mb-3" />
        <div className="h-4 w-96 bg-white/[0.04] rounded mx-auto" />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-6 w-12 bg-white/[0.04] rounded mx-auto mb-1" />
            <div className="h-3 w-16 bg-white/[0.04] rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Tier cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="aspect-square bg-white/[0.02]" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-32 bg-white/[0.04] rounded" />
              <div className="h-3 w-full bg-white/[0.04] rounded" />
              <div className="h-10 w-full bg-white/[0.04] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
