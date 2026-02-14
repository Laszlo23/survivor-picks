"use client";

import { Suspense, Component, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ReferralCapture } from "@/components/social/referral-capture";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/web3/config";
import { FarcasterProvider } from "@/lib/farcaster/provider";

const queryClient = new QueryClient();

// ── Error boundary to catch WalletConnect relay errors gracefully ────
class Web3ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: false }; // Don't block rendering — swallow WC relay errors
  }
  componentDidCatch(error: Error) {
    // Silence WalletConnect "Connection interrupted" errors — they happen
    // when projectId is missing/invalid and don't affect core app functionality.
    if (
      error.message?.includes("Connection interrupted") ||
      error.message?.includes("WebSocket connection failed")
    ) {
      console.warn("[WalletConnect] Relay connection failed — wallet features may be limited.", error.message);
      return;
    }
    console.error("[Web3ErrorBoundary]", error);
  }
  render() {
    return this.props.children;
  }
}

// Suppress WalletConnect relay WebSocket errors globally (they fire as
// unhandled promise rejections when the projectId is invalid/demo).
if (typeof window !== "undefined") {
  const origOnError = window.onunhandledrejection;
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const msg = event?.reason?.message || String(event?.reason || "");
    if (
      msg.includes("Connection interrupted") ||
      msg.includes("WebSocket connection failed") ||
      msg.includes("Missing or invalid") ||
      msg.includes("socket stalled")
    ) {
      event.preventDefault(); // Suppress the error overlay
      console.warn("[WalletConnect] Relay error suppressed:", msg);
      return;
    }
    if (origOnError) origOnError.call(window, event);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <FarcasterProvider>
              <TooltipProvider>
                <Suspense fallback={null}>
                  <ReferralCapture />
                </Suspense>
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </FarcasterProvider>
          </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  );
}
