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

  const badges = (badgeIds as bigint[] | undefined) || [];
  const hasBadges = badges.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">NFT Badges</h3>
        {hasBadges && (
          <span className="text-sm text-zinc-400">{badges.length} earned</span>
        )}
      </div>

      {/* Coming Soon banner */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-indigo-950/20 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-medium text-purple-300">Badges Coming Soon</p>
            <p className="text-xs text-purple-400/70 mt-0.5">
              Achievement badges will be automatically minted as NFTs when you hit milestones. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* Preview of available badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(BADGE_METADATA).slice(0, 8).map(([id, meta]) => (
          <div
            key={id}
            className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] opacity-50 grayscale"
          >
            <div className="text-3xl mb-2">{meta.icon}</div>
            <h4 className="text-sm font-medium text-white/60">{meta.name}</h4>
            <p className="text-xs text-zinc-500 mt-1">{meta.description}</p>
          </div>
        ))}
      </div>

      {/* Show earned badges if user has any */}
      {hasBadges && (
        <>
          <h4 className="text-sm font-semibold text-white mt-4">Your Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((id) => (
              <BadgeCard key={id.toString()} tokenId={Number(id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
