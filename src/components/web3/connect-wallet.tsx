"use client";

import { Component, type ReactNode } from "react";
import { Wallet } from "lucide-react";
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
    <button
      onClick={() => window.open("https://metamask.io", "_blank")}
      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
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
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm opacity-70 flex items-center gap-2"
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
    <WalletErrorBoundary>
      <RainbowKitWallet />
    </WalletErrorBoundary>
  );
}
