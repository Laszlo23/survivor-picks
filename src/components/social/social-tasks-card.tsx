"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "./share-button";
import {
  CheckCircle,
  Clock,
  Zap,
  Users,
  Trophy,
  Share2,
  Sparkles,
} from "lucide-react";
import type { SocialTaskWithStatus } from "@/lib/actions/social";

interface SocialTasksCardProps {
  tasks: SocialTaskWithStatus[];
  seasonId: string;
  referralCode?: string | null;
  rank?: number | null;
  totalPoints?: number;
  seasonTitle?: string;
}

export function SocialTasksCard({
  tasks,
  seasonId,
  referralCode,
  rank,
  totalPoints,
  seasonTitle,
}: SocialTasksCardProps) {
  const completedToday = tasks.filter((t) => t.completedToday).length;
  const allComplete = tasks.length > 0 && completedToday === tasks.length;
  const totalReward = tasks.reduce((sum, t) => sum + t.pointsReward, 0);

  const getTaskIcon = (key: string) => {
    switch (key) {
      case "share_prediction":
        return <Share2 className="h-4 w-4" />;
      case "share_result":
        return <Trophy className="h-4 w-4" />;
      case "share_rank":
        return <Zap className="h-4 w-4" />;
      case "invite_friend":
        return <Users className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getShareType = (key: string) => {
    switch (key) {
      case "share_prediction":
        return "prediction" as const;
      case "share_result":
        return "result_win" as const;
      case "share_rank":
        return "rank" as const;
      case "invite_friend":
        return "invite" as const;
      default:
        return "invite" as const;
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Daily tasks
          </CardTitle>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
              allComplete
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                : "text-muted-foreground bg-secondary/50"
            }`}
          >
            {completedToday}/{tasks.length}
          </span>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              allComplete ? "bg-neon-cyan" : "bg-amber-400"
            }`}
            style={{
              width: `${tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {allComplete && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-neon-cyan/5 border border-neon-cyan/20">
            <Sparkles className="h-4 w-4 text-neon-cyan shrink-0" />
            <p className="text-xs font-semibold text-neon-cyan">
              All tasks complete! +{totalReward} season points earned today
            </p>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              task.completedToday
                ? "bg-neon-cyan/5 border border-neon-cyan/20"
                : "bg-secondary/30 hover:bg-secondary/50"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                task.completedToday
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {task.completedToday ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                getTaskIcon(task.key)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.completedToday ? (
                  <span className="text-neon-cyan flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Done — resets in {task.cooldownHours}h
                  </span>
                ) : (
                  task.description
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-mono font-bold ${
                  task.completedToday ? "text-neon-cyan" : "text-amber-400"
                }`}
              >
                +{task.pointsReward}
              </span>
              {!task.completedToday && (
                <ShareButton
                  shareType={getShareType(task.key)}
                  shareData={{
                    referralCode,
                    rank: rank ?? undefined,
                    totalPoints,
                    seasonTitle,
                  }}
                  taskKey={task.key}
                  seasonId={seasonId}
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  label="Go"
                />
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks available right now
          </p>
        )}
      </CardContent>
    </Card>
  );
}
