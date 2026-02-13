"use client";

import { useAccount } from "wagmi";
import { useUserBadges, useBadgeURI } from "@/lib/web3/hooks";

// Badge metadata that we know about (from our contract setup)
const BADGE_METADATA: Record<number, { name: string; description: string; icon: string }> = {
  1: { name: "First Blood", description: "Made your first prediction", icon: "🩸" },
  2: { name: "Hot Streak x5", description: "5 correct predictions in a row", icon: "🔥" },
  3: { name: "Hot Streak x10", description: "10 correct predictions in a row", icon: "💥" },
  4: { name: "Risk Master", description: "Won 3 risk bets", icon: "🎯" },
  5: { name: "Social Butterfly", description: "Shared 10 predictions", icon: "🦋" },
  6: { name: "Referral King", description: "Referred 5 friends", icon: "👑" },
  7: { name: "Season 1 OG", description: "Participated in Season 1", icon: "⭐" },
  8: { name: "Diamond Hands", description: "Staked 100k+ $PICKS for 90+ days", icon: "💎" },
  9: { name: "Immunity Master", description: "Used all jokers successfully", icon: "🛡️" },
  10: { name: "Perfect Episode", description: "All predictions correct in one episode", icon: "✨" },
};

function BadgeCard({ tokenId }: { tokenId: number }) {
  const meta = BADGE_METADATA[tokenId] || {
    name: `Badge #${tokenId}`,
    description: "Achievement unlocked",
    icon: "🏆",
  };

  return (
    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all group">
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{meta.icon}</div>
      <h4 className="text-sm font-medium text-white">{meta.name}</h4>
      <p className="text-xs text-zinc-500 mt-1">{meta.description}</p>
    </div>
  );
}

export function BadgeGallery() {
  const { address } = useAccount();
  const { data: badgeIds, isLoading } = useUserBadges(address);

  if (!address) {
    return (
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
        <p className="text-zinc-400">Connect your wallet to view your NFT badges</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading badges...</span>
        </div>
      </div>
    );
  }

  const badges = (badgeIds as bigint[] | undefined) || [];

  if (badges.length === 0) {
    return (
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
        <p className="text-3xl mb-2">🏆</p>
        <p className="text-zinc-400">No badges yet</p>
        <p className="text-zinc-500 text-sm mt-1">Make predictions to earn achievements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your NFT Badges</h3>
        <span className="text-sm text-zinc-400">{badges.length} earned</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((id) => (
          <BadgeCard key={id.toString()} tokenId={Number(id)} />
        ))}
      </div>
    </div>
  );
}
