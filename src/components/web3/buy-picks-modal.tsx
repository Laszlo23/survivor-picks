"use client";

import { useState } from "react";
import { ExternalLink, X, Loader2, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getContractAddress, isContractDeployed } from "@/lib/web3/contracts";
import { useFarcaster } from "@/lib/farcaster/provider";

const PICKS_TOKEN_FALLBACK = "0x5294199EB963B6b868609B324D540B79BFbafB07";

function getSwapUrl() {
  let tokenAddress = PICKS_TOKEN_FALLBACK;
  try {
    const addr = getContractAddress("PicksToken");
    if (addr && addr !== "0x0") tokenAddress = addr;
  } catch {
    // Use fallback
  }
  return `https://app.uniswap.org/swap?outputCurrency=${tokenAddress}&chain=base&theme=dark`;
}

interface BuyPicksModalProps {
  children: React.ReactNode;
}

export function BuyPicksModal({ children }: BuyPicksModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isInMiniApp, swapToken } = useFarcaster();
  const swapUrl = getSwapUrl();

  // Inside Farcaster Mini App: use native swap UI (no iframe needed)
  const handleFarcasterSwap = async () => {
    let tokenAddress = PICKS_TOKEN_FALLBACK;
    try {
      const addr = getContractAddress("PicksToken");
      if (addr && addr !== "0x0") tokenAddress = addr;
    } catch {
      // Use fallback
    }
    await swapToken(tokenAddress);
  };

  // If in Farcaster Mini App, render a simple button that triggers native swap
  if (isInMiniApp) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 bg-studio-dark border-neon-cyan/20 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b border-white/[0.06]">
            <DialogTitle className="font-headline text-base font-bold uppercase tracking-wide text-white">
              Buy $PICKS
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-neon-cyan/10">
              <ArrowRightLeft className="h-8 w-8 text-neon-cyan" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[280px]">
              Swap ETH for $PICKS tokens directly through Farcaster&apos;s native swap.
            </p>
            <button
              onClick={handleFarcasterSwap}
              className="w-full py-3 px-6 bg-gradient-to-r from-neon-cyan to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Swap for $PICKS
            </button>
          </div>
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-studio-dark/50">
            <p className="text-[10px] text-muted-foreground text-center">
              Powered by Farcaster native swap on Base.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Standalone web mode: show Uniswap iframe
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] p-0 gap-0 bg-studio-dark border-neon-cyan/20 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-white/[0.06] flex flex-row items-center justify-between">
          <DialogTitle className="font-headline text-base font-bold uppercase tracking-wide text-white">
            Buy $PICKS
          </DialogTitle>
          <a
            href={swapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono text-neon-cyan/60 hover:text-neon-cyan transition-colors"
          >
            Open in Uniswap
            <ExternalLink className="h-3 w-3" />
          </a>
        </DialogHeader>

        {/* Iframe container */}
        <div className="relative w-full" style={{ height: "640px" }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-studio-dark z-10">
              <Loader2 className="h-8 w-8 text-neon-cyan animate-spin mb-3" />
              <p className="text-xs text-muted-foreground">Loading Uniswap...</p>
            </div>
          )}
          <iframe
            src={swapUrl}
            title="Buy $PICKS on Uniswap"
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            allow="clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        </div>

        {/* Fallback footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] bg-studio-dark/50">
          <p className="text-[10px] text-muted-foreground text-center">
            Swap powered by Uniswap on Base.{" "}
            <a
              href={swapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan/60 hover:text-neon-cyan underline"
            >
              Having trouble? Open Uniswap directly
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
