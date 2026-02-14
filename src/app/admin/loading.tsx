export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-white/[0.04] rounded mb-2" />
        <div className="h-4 w-64 bg-white/[0.04] rounded" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="h-4 w-20 bg-white/[0.04] rounded mb-2" />
            <div className="h-8 w-16 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-white/[0.04] rounded-lg" />
        ))}
      </div>

      {/* Content area */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
