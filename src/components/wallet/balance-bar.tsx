"use client";

import { useState } from "react";
import { Coins, CreditCard, Plus } from "lucide-react";
import { BuyPicksModal } from "./buy-picks-modal";

const PICKS_PRICE_USD = 0.00333;

interface BalanceBarProps {
  balance: string;
}

export function BalanceBar({ balance }: BalanceBarProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const bal = Number(balance);
  const usdValue = bal * PICKS_PRICE_USD;

  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-cyan/10">
            <Coins className="h-3.5 w-3.5 text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm font-bold font-mono text-white leading-none">
              {bal.toLocaleString()}
              <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                $PICKS
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              ≈ ${usdValue.toFixed(2)} USD
            </p>
          </div>
        </div>
        <button
          onClick={() => setBuyOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold hover:bg-neon-cyan/20 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Buy
        </button>
      </div>
      <BuyPicksModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
