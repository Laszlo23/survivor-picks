"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    email: string;
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">{seasonTitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-secondary/30 rounded-lg w-fit">
        <button
          onClick={() => setTab("points")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            tab === "points"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" />
          Points
        </button>
        <button
          onClick={() => setTab("community")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            tab === "community"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Community
        </button>
      </div>

      {tab === "points" ? (
        <>
          {/* Search */}
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

          {/* Points Table */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {data.total} player{data.total !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-right">Points</div>
                  <div className="col-span-2 text-right hidden sm:block">
                    Record
                  </div>
                  <div className="col-span-1 text-right hidden sm:block">
                    Win%
                  </div>
                  <div className="col-span-2 text-right">Streak</div>
                </div>

                {data.entries.map((entry) => {
                  const isCurrentUser = entry.user.id === currentUserId;
                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-2 items-center rounded-lg px-3 py-3 text-sm ${
                        isCurrentUser
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="col-span-1">
                        <span
                          className={`font-bold ${
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
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                          {entry.user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="truncate font-medium">
                          {entry.user.name || "Anonymous"}
                          {isCurrentUser && (
                            <span className="text-xs text-primary ml-1">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-primary">
                        {entry.points.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right text-muted-foreground hidden sm:block">
                        {entry.correctCount}/{entry.totalCount}
                      </div>
                      <div className="col-span-1 text-right hidden sm:block">
                        {Math.round(entry.winRate * 100)}%
                      </div>
                      <div className="col-span-2 text-right">
                        {entry.currentStreak > 0 && (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Flame className="h-3 w-3" />
                            {entry.currentStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {data.entries.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    No players found
                  </p>
                )}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
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
        /* Community Tab */
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Community Champions — Social Points + Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-right">Social Pts</div>
                <div className="col-span-2 text-right">Referrals</div>
                <div className="col-span-3 text-right">Total Pts</div>
              </div>

              {communityData && communityData.length > 0 ? (
                communityData.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`grid grid-cols-12 gap-2 items-center rounded-lg px-3 py-3 text-sm ${
                        isCurrentUser
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="col-span-1">
                        <span
                          className={`font-bold ${
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
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                          {entry.name[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="truncate font-medium">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="text-xs text-primary ml-1">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono font-bold text-amber-400">
                        {entry.socialPoints.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        {entry.referralCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Users className="h-3 w-3" />
                            {entry.referralCount}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 text-right font-mono text-muted-foreground">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">
                    No community activity yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first! Share predictions and invite friends to earn
                    social points.
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
