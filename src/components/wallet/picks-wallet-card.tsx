"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Coins,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyPicksModal } from "./buy-picks-modal";

const PICKS_PRICE_USD = 0.00333;

interface TokenTx {
  id: string;
  amount: string;
  type: string;
  createdAt: string;
}

interface PicksWalletCardProps {
  offChainBalance: string;
  tokenTxs: TokenTx[];
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function PicksWalletCard({ offChainBalance, tokenTxs }: PicksWalletCardProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const searchParams = useSearchParams();
  const purchaseSuccess = searchParams.get("purchase") === "success";
  const purchasePicks = searchParams.get("picks");

  const balance = Number(offChainBalance);
  const usdValue = balance * PICKS_PRICE_USD;

  return (
    <>
      <Card className="border-white/[0.08] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-gold" />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Coins className="h-5 w-5 text-neon-cyan" />
              $PICKS Wallet
            </CardTitle>
            <button
              onClick={() => setBuyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan text-studio-black text-xs font-bold hover:bg-neon-cyan/90 transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Buy $PICKS
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {purchaseSuccess && purchasePicks && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300">
                {Number(purchasePicks).toLocaleString()} $PICKS added to your wallet!
              </p>
            </div>
          )}

          {/* Total value */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-neon-cyan/[0.08] to-neon-magenta/[0.04] border border-neon-cyan/20">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Your Balance
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {balance.toLocaleString()}
              </p>
              <span className="text-sm text-neon-cyan font-bold">$PICKS</span>
            </div>
            <p className="text-sm font-mono text-muted-foreground mt-1 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {usdValue.toFixed(2)} USD
              <span className="text-[10px] ml-1 text-white/30">@ $0.00333</span>
            </p>
          </div>

          {/* Recent activity */}
          {tokenTxs.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
              <p className="text-xs font-bold text-white mb-3">Recent Activity</p>
              <div className="space-y-2.5">
                {tokenTxs.map((tx) => {
                  const amt = Number(tx.amount);
                  const isPositive = amt > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
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
                        <span className="text-muted-foreground capitalize">
                          {tx.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {amt.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-16 text-right">
                          {timeAgo(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Tokens convert 1:1 on-chain at fair launch &bull; $0.00<span className="text-neon-gold">333</span>/token
          </p>
        </CardContent>
      </Card>

      <BuyPicksModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
