export default function StakingLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-24 bg-white/[0.04] rounded mb-4" />
        <div className="h-8 w-56 bg-white/[0.04] rounded mb-2" />
        <div className="h-4 w-72 bg-white/[0.04] rounded" />
      </div>

      {/* Balance card */}
      <div className="mb-8 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-28 bg-white/[0.04] rounded mb-2" />
            <div className="h-10 w-40 bg-white/[0.04] rounded" />
          </div>
          <div className="h-14 w-14 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>

      {/* Staking panel */}
      <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="h-6 w-32 bg-white/[0.04] rounded mb-6" />
        <div className="space-y-4">
          <div className="h-12 rounded-lg bg-white/[0.04]" />
          <div className="h-12 rounded-lg bg-white/[0.04]" />
          <div className="h-10 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
