"use client";

import { Component, type ReactNode } from "react";
import { Wallet } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import "@rainbow-me/rainbowkit/styles.css";

// Error boundary to prevent RainbowKit/WalletConnect errors from crashing the page
class WalletErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <WalletFallback />;
    }
    return this.props.children;
  }
}

function WalletFallback() {
  return (
    <div className="space-y-2">
      <button
        onClick={() => window.open("https://metamask.io", "_blank")}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_hsl(220_80%_55%/0.2)]"
      >
        <Wallet className="h-4 w-4" />
        Get a Wallet
      </button>
      <p className="text-xs text-muted-foreground text-center">
        <a href="https://metamask.io" target="_blank" className="text-blue-400 hover:underline">
          Learn about wallets
        </a>
      </p>
    </div>
  );
}

// Lazy load RainbowKit to avoid SSR issues
import dynamic from "next/dynamic";

const RainbowKitWallet = dynamic(
  () => import("./connect-wallet-inner").then((m) => ({ default: m.ConnectWalletInner })),
  {
    ssr: false,
    loading: () => (
      <button
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm opacity-70 flex items-center gap-2"
        disabled
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    ),
  }
);

export function ConnectWallet() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <WalletErrorBoundary>
            <RainbowKitWallet />
          </WalletErrorBoundary>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-center">
        <p className="text-xs">
          New to crypto? A wallet is like a digital pocket for your tokens.{" "}
          <a href="https://metamask.io" target="_blank" className="text-blue-400 hover:underline">
            Learn more
          </a>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
