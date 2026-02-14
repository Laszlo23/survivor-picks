const NETWORK_COLORS: Record<string, string> = {
  CBS: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  ABC: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  Peacock: "border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10",
  NBC: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  FOX: "border-red-500/40 text-red-400 bg-red-500/10",
  Bravo: "border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-500/10",
  Netflix: "border-red-600/40 text-red-500 bg-red-600/10",
};

interface NetworkBadgeProps {
  network: string;
}

export function NetworkBadge({ network }: NetworkBadgeProps) {
  const colors = NETWORK_COLORS[network] || "border-white/20 text-white/60 bg-white/5";

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${colors}`}
    >
      {network}
    </span>
  );
}
