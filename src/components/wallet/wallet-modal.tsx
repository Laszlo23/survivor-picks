"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Coins,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Loader2,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { BuyPicksModal } from "./buy-picks-modal";
import { PICKS_PRICE_USD } from "@/lib/picks-config";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

interface Tx {
  id: string;
  amount: string;
  type: string;
  note: string | null;
  createdAt: string;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);

  const purchaseSuccess = searchParams.get("purchase") === "success";
  const purchasePicks = searchParams.get("picks");

  useEffect(() => {
    if (purchaseSuccess) {
      const url = new URL(window.location.href);
      url.searchParams.delete("purchase");
      url.searchParams.delete("picks");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [purchaseSuccess]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/user/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.balance !== undefined) setBalance(data.balance);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      })
      .catch(() => {
        if (!cancelled) setBalance("0");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const bal = Number(balance);
  const usdValue = bal * PICKS_PRICE_USD;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            <div className="fixed inset-0 z-[101] overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-studio-dark shadow-2xl"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between p-4 pb-0">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-neon-cyan" />
                      <h2 className="text-lg font-display font-bold text-white">
                        Wallet
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                    >
                      <X className="h-4 w-4 text-white/60" />
                    </button>
                  </div>

                  <div className="p-6 pt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
                  </div>
                ) : (
                  <>
                    {purchaseSuccess && purchasePicks && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                        <p className="text-xs text-emerald-300">
                          {Number(purchasePicks).toLocaleString()} $PICKS added to your wallet!
                        </p>
                      </div>
                    )}

                    {/* Balances */}
                    <div className="space-y-3 mb-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-neon-cyan/[0.08] to-neon-magenta/[0.04] border border-neon-cyan/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="h-4 w-4 text-neon-cyan" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            $PICKS
                          </span>
                        </div>
                        <p className="text-2xl font-bold font-mono text-white">
                          {bal.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ≈ ${usdValue.toFixed(2)} USD @ $0.00333
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] border-dashed">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-400/50" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              USDC
                            </span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground uppercase tracking-wider font-bold">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          On-chain USDC withdrawals unlock at fair launch
                        </p>
                      </div>
                    </div>

                    {/* Buy button */}
                    <button
                      onClick={() => setBuyOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan text-studio-black font-bold text-sm hover:bg-neon-cyan/90 transition-colors mb-6"
                    >
                      <CreditCard className="h-4 w-4" />
                      Buy $PICKS with Card
                    </button>

                    {/* Transaction history */}
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                      <p className="text-xs font-bold text-white mb-3">
                        Recent Activity
                      </p>
                      {transactions.length > 0 ? (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto">
                          {transactions.map((tx) => {
                            const amt = Number(tx.amount);
                            const isPositive = amt > 0;
                            return (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`shrink-0 h-6 w-6 flex items-center justify-center rounded-full ${
                                      isPositive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {isPositive ? (
                                      <ArrowDownLeft className="h-3 w-3" />
                                    ) : (
                                      <ArrowUpRight className="h-3 w-3" />
                                    )}
                                  </div>
                                  <span className="text-muted-foreground capitalize truncate">
                                    {tx.type.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span
                                    className={`font-mono font-bold ${
                                      isPositive
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {isPositive ? "+" : ""}
                                    {amt.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground w-14 text-right">
                                    {timeAgo(tx.createdAt)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          No transactions yet
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center mt-4">
                      KYC required before exchanging to on-chain tokens
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </>
        )}
      </AnimatePresence>

      <BuyPicksModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
