export default function TokenLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-24 bg-white/[0.04] rounded mb-4" />
        <div className="h-8 w-48 bg-white/[0.04] rounded mb-2" />
        <div className="h-4 w-64 bg-white/[0.04] rounded" />
      </div>

      {/* Balance card */}
      <div className="mb-8 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="h-4 w-28 bg-white/[0.04] rounded mb-2" />
        <div className="h-10 w-40 bg-white/[0.04] rounded" />
      </div>

      {/* Buy/Trade cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-24 rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        <div className="h-24 rounded-xl border border-white/[0.06] bg-white/[0.02]" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}
