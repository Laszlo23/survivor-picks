import { Trophy } from "lucide-react";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" />
          Leaderboard
        </h1>
        <div className="h-4 w-36 bg-muted rounded mt-2" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-24 bg-muted rounded-lg" />
        <div className="h-9 w-24 bg-muted/50 rounded-lg" />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border/30 bg-card/30 px-4 py-3"
          >
            <div className="h-6 w-8 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted/50 rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
