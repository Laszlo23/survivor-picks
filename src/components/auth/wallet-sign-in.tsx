"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";

type Phase = "idle" | "signing" | "verifying" | "success" | "error";

function WalletSignInInner() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (!address || !chain) return;

    setPhase("signing");
    setError(null);

    try {
      // 1. Get nonce from server
      const nonceRes = await fetch("/api/auth/wallet/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message using viem's official EIP-4361 formatter
      const messageToSign = createSiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to RealityPicks with your wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
        nonce,
      });

      // 3. Request wallet signature
      const signature = await signMessageAsync({ message: messageToSign });

      // 4. Verify on server
      setPhase("verifying");
      const authRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSign, signature }),
      });

      if (!authRes.ok) {
        const data = await authRes.json().catch(() => ({}));
        const errMsg = data.detail
          ? `${data.error}: ${data.detail}`
          : data.error || "Authentication failed";
        throw new Error(errMsg);
      }

      // 5. Success — redirect to dashboard
      setPhase("success");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setError("Signature request was cancelled.");
      } else {
        setError(msg);
      }
      setPhase("error");
    }
  }, [address, chain, signMessageAsync, router]);

  // Auto-trigger sign-in once wallet connects
  useEffect(() => {
    if (isConnected && address && chain && phase === "idle") {
      handleSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chain]);

  // If wallet is connected, show the sign-in flow
  if (isConnected && address) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
              <Wallet className="h-4 w-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {chain?.name || "Connected"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              disconnect();
              setPhase("idle");
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>

        {phase === "signing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
            <span>Approve the signature in your wallet...</span>
          </div>
        )}

        {phase === "verifying" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
            <span>Verifying signature...</span>
          </div>
        )}

        {phase === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Signed in! Redirecting...</span>
          </div>
        )}

        {phase === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={handleSignIn}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Not connected — show connect button
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        if (!mounted) return null;
        return (
          <button
            onClick={openConnectModal}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3.5 text-sm font-semibold text-white hover:bg-neon-cyan/10 hover:border-neon-cyan/30 transition-all group"
          >
            <Wallet className="h-5 w-5 text-neon-cyan group-hover:scale-110 transition-transform" />
            Connect Wallet
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function WalletSignIn() {
  return (
    <RainbowKitProvider
      theme={darkTheme({
        accentColor: "hsl(185 100% 55%)",
        accentColorForeground: "white",
        borderRadius: "large",
        overlayBlur: "small",
      })}
    >
      <WalletSignInInner />
    </RainbowKitProvider>
  );
}
