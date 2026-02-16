"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

const VOTE_OPTIONS = [
  { id: "love-island", label: "Love Island USA", emoji: "\uD83C\uDFDD\uFE0F" },
  { id: "big-brother", label: "Big Brother", emoji: "\uD83D\uDC41\uFE0F" },
  { id: "amazing-race", label: "The Amazing Race", emoji: "\uD83C\uDFC1" },
  { id: "drag-race", label: "RuPaul's Drag Race", emoji: "\uD83D\uDC51" },
  { id: "masked-singer", label: "The Masked Singer", emoji: "\uD83C\uDFAD" },
  { id: "squid-game", label: "Squid Game: The Challenge", emoji: "\uD83E\uDE86" },
];

const STORAGE_KEY = "rp-community-vote";

interface VoteState {
  votes: Record<string, number>;
  userVote: string | null;
}

function getInitialState(): VoteState {
  if (typeof window === "undefined") {
    return { votes: {}, userVote: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { votes: {}, userVote: null };
}

export function LandingCommunityVote() {
  const [state, setState] = useState<VoteState>({ votes: {}, userVote: null });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getInitialState());
  }, []);

  const totalVotes = Object.values(state.votes).reduce((a, b) => a + b, 0);

  const handleVote = (id: string) => {
    if (state.userVote) return;
    const newVotes = { ...state.votes, [id]: (state.votes[id] || 0) + 1 };
    const newState = { votes: newVotes, userVote: id };
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  };

  if (!mounted) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <FadeIn>
        <div className="text-center mb-8">
          <LowerThird label="YOUR VOICE" value="Vote for the Next Show" />
          <p className="text-sm text-muted-foreground mt-4">
            Which reality TV show should we add next? Cast your vote.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="space-y-2">
          {VOTE_OPTIONS.map((opt) => {
            const count = state.votes[opt.id] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = state.userVote === opt.id;
            const hasVoted = state.userVote !== null;

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={hasVoted}
                className={`w-full p-3 rounded-xl text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-neon-cyan/10 border-2 border-neon-cyan/40"
                    : hasVoted
                      ? "bg-white/[0.02] border border-white/[0.06] cursor-default"
                      : "bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] cursor-pointer"
                }`}
              >
                {/* Progress bar */}
                {hasVoted && (
                  <div
                    className={`absolute inset-y-0 left-0 ${isSelected ? "bg-neon-cyan/10" : "bg-white/[0.03]"} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-sm font-medium text-white">{opt.label}</span>
                  </div>
                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{count} votes</span>
                      <span className={`font-mono text-sm font-bold ${isSelected ? "text-neon-cyan" : "text-white/50"}`}>
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {state.userVote && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Thanks for voting! {totalVotes} total votes cast.
          </p>
        )}
      </FadeIn>
    </section>
  );
}
