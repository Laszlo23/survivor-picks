"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion";
import {
  Trophy,
  Search,
  ChevronLeft,
  ChevronRight,
  Flame,
  Users,
  Share2,
  Zap,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  points: number;
  correctCount: number;
  totalCount: number;
  currentStreak: number;
  winRate: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommunityEntry {
  rank: number;
  userId: string;
  name: string;
  socialPoints: number;
  referralCount: number;
  totalPoints: number;
}

type Tab = "points" | "community";

const rankGlow: Record<number, string> = {
  1: "shadow-[0_0_15px_hsl(40_90%_55%/0.2)] border-amber-500/30",
  2: "shadow-[0_0_12px_hsl(210_10%_60%/0.15)] border-gray-400/30",
  3: "shadow-[0_0_12px_hsl(30_70%_40%/0.15)] border-amber-700/30",
};

export function LeaderboardClient({
  data,
  seasonTitle,
  currentUserId,
  search: initialSearch,
  communityData,
}: {
  data: {
    entries: LeaderboardEntry[];
    total: number;
    page: number;
    totalPages: number;
  };
  seasonTitle: string;
  currentUserId: string;
  search: string;
  tribes: { id: string; name: string; color: string }[];
  communityData?: CommunityEntry[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [tab, setTab] = useState<Tab>("points");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/leaderboard?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/leaderboard?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">{seasonTitle}</p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <div className="relative flex gap-1 mb-6 p-1 bg-white/[0.03] border border-white/[0.06] rounded-lg w-fit">
        {(["points", "community"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              tab === t
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === t && (
              <motion.div
                layoutId="leaderboard-tab"
                className="absolute inset-0 rounded-md bg-white/[0.06] border border-white/[0.08]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">
              {t === "points" ? (
                <Zap className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </span>
            <span className="relative">
              {t === "points" ? "Points" : "Community results"}
            </span>
          </button>
        ))}
      </div>

      {tab === "points" ? (
        <>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
          </form>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {data.total} player{data.total !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <div className="w-7 shrink-0 text-center">#</div>
                  <div className="flex-1 min-w-0">Player</div>
                  <div className="w-16 text-right shrink-0">Points</div>
                  <div className="w-14 text-right shrink-0 hidden sm:block">Record</div>
                  <div className="w-12 text-right shrink-0 hidden sm:block">Win%</div>
                  <div className="w-12 text-right shrink-0">Streak</div>
                </div>

                {data.entries.map((entry, i) => {
                  const isCurrentUser = entry.user.id === currentUserId;
                  const glow = rankGlow[entry.rank] || "";
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition-all ${
                        isCurrentUser
                          ? "bg-primary/10 border border-primary/20 shadow-[0_0_15px_hsl(185_100%_55%/0.1)]"
                          : entry.rank <= 3
                          ? `border ${glow} bg-white/[0.02]`
                          : "border border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="w-7 shrink-0 text-center">
                        <span
                          className={`font-display font-bold ${
                            entry.rank === 1
                              ? "text-gradient-gold"
                              : entry.rank === 2
                              ? "text-gray-400"
                              : entry.rank === 3
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-1 ring-primary/20">
                          {entry.user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="truncate font-medium">
                          {entry.user.name || "Anonymous"}
                          {isCurrentUser && (
                            <span className="text-xs text-primary ml-1">(you)</span>
                          )}
                        </span>
                      </div>
                      <div className="w-16 text-right shrink-0 font-mono font-bold text-primary">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="w-14 text-right text-muted-foreground shrink-0 hidden sm:block">
                        {entry.correctCount}/{entry.totalCount}
                      </div>
                      <div className="w-12 text-right shrink-0 hidden sm:block">
                        {Math.round(entry.winRate * 100)}%
                      </div>
                      <div className="w-12 text-right shrink-0">
                        {entry.currentStreak > 0 && (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Flame className="h-3 w-3" />
                            {entry.currentStreak}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {data.entries.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    {data.total === 0
                      ? "No one has joined yet. Be the first!"
                      : "No players found"}
                  </p>
                )}
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(data.page - 1)}
                      disabled={data.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(data.page + 1)}
                      disabled={data.page >= data.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Community Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="w-7 shrink-0 text-center">#</div>
                <div className="flex-1 min-w-0">Player</div>
                <div className="w-16 text-right shrink-0">Social</div>
                <div className="w-14 text-right shrink-0 hidden sm:block">Refs</div>
                <div className="w-16 text-right shrink-0">Total</div>
              </div>

              {communityData && communityData.length > 0 ? (
                communityData.map((entry, i) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${
                        isCurrentUser
                          ? "bg-primary/10 border border-primary/20"
                          : "border border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="w-7 shrink-0 text-center">
                        <span
                          className={`font-display font-bold ${
                            entry.rank === 1
                              ? "text-amber-400"
                              : entry.rank === 2
                              ? "text-gray-400"
                              : entry.rank === 3
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                          {entry.name[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="truncate font-medium">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-xs text-primary ml-1">(you)</span>
                          )}
                        </span>
                      </div>
                      <div className="w-16 text-right shrink-0 font-mono font-bold text-amber-400">
                        {entry.socialPoints.toLocaleString()}
                      </div>
                      <div className="w-14 text-right shrink-0 hidden sm:block">
                        {entry.referralCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Users className="h-3 w-3" />
                            {entry.referralCount}
                          </span>
                        )}
                      </div>
                      <div className="w-16 text-right shrink-0 font-mono text-muted-foreground">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-4 animate-float">
                    <Users className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    No community activity yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first! Share predictions and invite friends.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
