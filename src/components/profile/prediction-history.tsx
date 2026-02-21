"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Flame, Shield, Loader2, Target } from "lucide-react";

type Prediction = {
  id: string;
  chosenOption: string;
  isRisk: boolean;
  usedJoker: boolean;
  pointsAwarded: number | null;
  isCorrect: boolean | null;
  createdAt: string;
  question: {
    prompt: string;
    correctOption: string | null;
    episode: {
      number: number;
      title: string;
      season: { title: string };
    };
  };
};

type PredictionHistoryProps = {
  initialPredictions: Prediction[];
  initialTotal: number;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "pending", label: "Pending" },
] as const;

export function PredictionHistory({ initialPredictions, initialTotal }: PredictionHistoryProps) {
  const [filter, setFilter] = useState<"all" | "won" | "lost" | "pending">("all");
  const [predictions, setPredictions] = useState(initialPredictions);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchFiltered(f: typeof filter) {
    setLoading(true);
    setFilter(f);
    try {
      const res = await fetch(`/api/profile/predictions?filter=${f}&limit=20&offset=0`);
      const data = await res.json();
      setPredictions(data.predictions);
      setTotal(data.total);
    } catch { /* keep current */ }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/profile/predictions?filter=${filter}&limit=20&offset=${predictions.length}`);
      const data = await res.json();
      setPredictions((prev) => [...prev, ...data.predictions]);
      setTotal(data.total);
    } catch { /* keep current */ }
    setLoadingMore(false);
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => fetchFiltered(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-white/[0.1] text-white"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No predictions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {predictions.map((pred) => (
              <div
                key={pred.id}
                className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className="shrink-0">
                  {pred.isCorrect === true ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : pred.isCorrect === false ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pred.question.prompt}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {pred.question.episode.season.title} &middot; Ep. {pred.question.episode.number}
                    </span>
                    <span className="text-xs">
                      Picked: <span className={pred.isCorrect === true ? "text-emerald-400 font-medium" : pred.isCorrect === false ? "text-red-400" : "text-white"}>{pred.chosenOption}</span>
                    </span>
                    {pred.isCorrect === false && pred.question.correctOption && (
                      <span className="text-xs text-muted-foreground">
                        Correct: <span className="text-emerald-400">{pred.question.correctOption}</span>
                      </span>
                    )}
                    {pred.isRisk && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                        <Flame className="h-2.5 w-2.5" /> Risk
                      </span>
                    )}
                    {pred.usedJoker && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        <Shield className="h-2.5 w-2.5" /> Joker
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {pred.pointsAwarded !== null ? (
                    <span className={`font-mono font-bold text-sm ${pred.pointsAwarded > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {pred.pointsAwarded > 0 ? "+" : ""}{pred.pointsAwarded}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {predictions.length < total && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1.5" /> : null}
                Load More ({total - predictions.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
