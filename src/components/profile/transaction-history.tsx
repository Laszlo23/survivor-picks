"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet, CreditCard, Gift, Trophy, Sparkles, Coins } from "lucide-react";

type Transaction = {
  id: string;
  amount: string;
  type: string;
  note: string | null;
  createdAt: string;
};

type TransactionHistoryProps = {
  initialTransactions: Transaction[];
  initialTotal: number;
  balance: string;
};

const TX_FILTERS = [
  { key: "all", label: "All" },
  { key: "stripe_purchase", label: "Purchases" },
  { key: "prediction_reward", label: "Rewards" },
  { key: "signup_bonus", label: "Bonuses" },
] as const;

const TYPE_CONFIG: Record<string, { icon: typeof Wallet; label: string; color: string }> = {
  signup_bonus: { icon: Gift, label: "Signup Bonus", color: "text-emerald-400" },
  stripe_purchase: { icon: CreditCard, label: "Purchase", color: "text-neon-cyan" },
  prediction_reward: { icon: Trophy, label: "Reward", color: "text-amber-400" },
  daily_streak: { icon: Sparkles, label: "Streak Bonus", color: "text-orange-400" },
  season_pass: { icon: Sparkles, label: "Season Pass", color: "text-violet-400" },
  staking: { icon: Coins, label: "Staking", color: "text-primary" },
  admin_credit: { icon: Gift, label: "Admin Credit", color: "text-emerald-400" },
};

function formatAmount(amount: string) {
  const n = BigInt(amount);
  const abs = n < 0 ? -n : n;
  const formatted = abs > BigInt(999_999)
    ? `${(Number(abs) / 1_000_000).toFixed(2)}M`
    : abs > BigInt(999)
    ? `${(Number(abs) / 1_000).toFixed(1)}K`
    : Number(abs).toLocaleString();
  return { formatted, isPositive: n >= 0 };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransactionHistory({ initialTransactions, initialTotal, balance }: TransactionHistoryProps) {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const balanceBigInt = BigInt(balance);
  const usdValue = (Number(balanceBigInt) * 0.00333).toFixed(2);

  async function fetchFiltered(f: string) {
    setLoading(true);
    setFilter(f);
    try {
      const res = await fetch(`/api/profile/transactions?filter=${f}&limit=20&offset=0`);
      const data = await res.json();
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch { /* keep current */ }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/profile/transactions?filter=${filter}&limit=20&offset=${transactions.length}`);
      const data = await res.json();
      setTransactions((prev) => [...prev, ...data.transactions]);
      setTotal(data.total);
    } catch { /* keep current */ }
    setLoadingMore(false);
  }

  return (
    <div>
      {/* Balance card */}
      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-neon-cyan/10 to-transparent p-5 mb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">$PICKS Balance</p>
        <p className="text-3xl font-bold font-mono text-neon-cyan">
          {Number(balanceBigInt).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          &asymp; ${usdValue} USD
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] w-fit">
        {TX_FILTERS.map((f) => (
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
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {transactions.map((tx) => {
              const config = TYPE_CONFIG[tx.type] || { icon: Wallet, label: tx.type, color: "text-muted-foreground" };
              const { formatted, isPositive } = formatAmount(tx.amount);
              const Icon = config.icon;

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{config.label}</p>
                    {tx.note && (
                      <p className="text-xs text-muted-foreground truncate">{tx.note}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowDownLeft className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`font-mono font-bold text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : "-"}{formatted}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(tx.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {transactions.length < total && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1.5" /> : null}
                Load More ({total - transactions.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
