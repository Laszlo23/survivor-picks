"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, Target, Wallet, Award, Flame, Shield, Share2, Users, CreditCard } from "lucide-react";
import { ProfileHeader } from "./profile-header";
import { ProfileEditModal } from "./profile-edit-modal";
import { StatsGrid } from "./stats-grid";
import { PredictionHistory } from "./prediction-history";
import { TransactionHistory } from "./transaction-history";
import { updateProfile } from "@/lib/actions/profile";
import { WalletModal } from "@/components/wallet/wallet-modal";

type SeasonStat = {
  id: string;
  points: number;
  correctCount: number;
  totalCount: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
  tribeLoyaltyCorrect: number;
  riskBetsWon: number;
  riskBetsTotal: number;
  jokersUsed: number;
  jokersRemaining: number;
  socialPoints: number;
  referralCount: number;
  season: { title: string };
};

type BadgeEntry = {
  id: string;
  badge: { icon: string; title: string; description: string };
};

type ProfileData = {
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  email: string;
  createdAt: string;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialTiktok: string | null;
  socialFarcaster: string | null;
  socialWebsite: string | null;
};

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

type Transaction = {
  id: string;
  amount: string;
  type: string;
  note: string | null;
  createdAt: string;
};

type ProfileTabsProps = {
  profile: ProfileData;
  stats: {
    totalPoints: number;
    totalCorrect: number;
    totalPredictions: number;
    overallWinRate: number;
    bestStreak: number;
    seasonsPlayed: number;
    totalPicksEarned: string;
    totalPicksSpent: string;
    memberSince: string;
  };
  rank: { rank: number; totalPlayers: number } | null;
  seasonStats: SeasonStat | null;
  socialStats: { socialPoints: number; referralCount: number } | null;
  badges: BadgeEntry[];
  predictions: Prediction[];
  predictionsTotal: number;
  transactions: Transaction[];
  transactionsTotal: number;
  balance: string;
  referralStats: unknown;
  seasonId: string | null;
};

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "predictions", label: "Predictions", icon: Target },
  { key: "wallet", label: "Wallet", icon: Wallet },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProfileTabs({
  profile, stats, rank, seasonStats, socialStats, badges,
  predictions, predictionsTotal, transactions, transactionsTotal,
  balance, seasonId,
}: ProfileTabsProps) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <ProfileHeader
        name={profile.name}
        username={profile.username}
        image={profile.image}
        bio={profile.bio}
        email={profile.email}
        createdAt={profile.createdAt}
        socialTwitter={profile.socialTwitter}
        socialInstagram={profile.socialInstagram}
        socialTiktok={profile.socialTiktok}
        socialFarcaster={profile.socialFarcaster}
        socialWebsite={profile.socialWebsite}
        quickStats={{
          totalPoints: stats.totalPoints,
          winRate: stats.overallWinRate,
          rank: rank?.rank ?? null,
          totalPlayers: rank?.totalPlayers ?? null,
          bestStreak: stats.bestStreak,
        }}
        onEdit={() => setEditOpen(true)}
      />

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-6">
          {stats.totalPredictions === 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
              <p className="text-sm font-medium text-white mb-1">Welcome to RealityPicks!</p>
              <p className="text-xs text-muted-foreground mb-3">
                You haven&apos;t made any predictions yet. Head to the markets to get started.
              </p>
              <a
                href="/play"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-studio-black text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Target className="h-4 w-4" />
                Start Predicting
              </a>
            </div>
          )}

          <StatsGrid
            stats={{
              totalPoints: stats.totalPoints,
              overallWinRate: stats.overallWinRate,
              rank: rank?.rank ?? null,
              totalPlayers: rank?.totalPlayers ?? null,
              bestStreak: stats.bestStreak,
              totalPredictions: stats.totalPredictions,
              totalPicksEarned: stats.totalPicksEarned,
            }}
          />

          {/* Season stats */}
          {seasonStats && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-sm font-display font-bold flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-primary" />
                {seasonStats.season.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                {[
                  { label: "Correct", value: `${seasonStats.correctCount}/${seasonStats.totalCount}` },
                  { label: "Win Rate", value: `${Math.round(seasonStats.winRate * 100)}%` },
                  { label: "Current Streak", value: `${seasonStats.currentStreak}` },
                  { label: "Longest Streak", value: `${seasonStats.longestStreak}` },
                  { label: "Risk Bets Won", value: `${seasonStats.riskBetsWon}/${seasonStats.riskBetsTotal}`, icon: Flame, color: "text-orange-400" },
                  { label: "Jokers Left", value: `${seasonStats.jokersRemaining}/3`, icon: Shield, color: "text-primary" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between sm:flex-col sm:gap-0.5">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      {"icon" in item && item.icon && <item.icon className={`h-3 w-3 ${item.color}`} />}
                      {item.label}
                    </span>
                    <span className="font-mono font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
              {socialStats && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between sm:flex-col sm:gap-0.5">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Share2 className="h-3 w-3 text-amber-400" /> Social Points
                    </span>
                    <span className="font-mono font-bold text-amber-400">{socialStats.socialPoints}</span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:gap-0.5">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" /> Referrals
                    </span>
                    <span className="font-mono font-bold">{socialStats.referralCount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-display font-bold flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-amber-400" />
              Badges Earned
            </h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((ub) => (
                  <div
                    key={ub.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-2xl">{ub.badge.icon}</span>
                    <p className="text-xs font-medium mt-1">{ub.badge.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ub.badge.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Keep playing to unlock badges!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "predictions" && (
        <PredictionHistory
          initialPredictions={predictions}
          initialTotal={predictionsTotal}
        />
      )}

      {tab === "wallet" && (
        <div className="space-y-4">
          <TransactionHistory
            initialTransactions={transactions}
            initialTotal={transactionsTotal}
            balance={balance}
          />
          <button
            onClick={() => setWalletOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/20 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Buy More $PICKS
          </button>
        </div>
      )}

      {/* Edit modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <ProfileEditModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            initial={profile}
            onSave={updateProfile}
          />,
          document.body
        )}

      {/* Wallet modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />,
          document.body
        )}
    </>
  );
}
