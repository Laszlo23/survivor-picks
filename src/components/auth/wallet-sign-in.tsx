"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { signIn, useSession } from "next-auth/react";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";

type Phase = "idle" | "signing" | "verifying" | "success" | "error";

function WalletSignInInner() {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { status, update: updateSession } = useSession();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const signingRef = useRef(false);
  const redirectingRef = useRef(false);

  // If already authenticated on mount or after signIn, redirect immediately
  useEffect(() => {
    if (status === "authenticated" && !redirectingRef.current) {
      redirectingRef.current = true;
      window.location.href = "/dashboard";
    }
  }, [status]);

  const waitForSession = useCallback(async () => {
    // Poll useSession via update() until status flips to authenticated
    for (let i = 0; i < 15; i++) {
      await updateSession();
      // Small delay between polls
      await new Promise((r) => setTimeout(r, 300));
      // After update, the status change will be picked up by the useEffect above
    }
  }, [updateSession]);

  const handleSignIn = useCallback(async () => {
    if (!address || !chain) return;
    if (signingRef.current) return;
    signingRef.current = true;

    setPhase("signing");
    setError(null);

    try {
      // 1. Get nonce
      const nonceRes = await fetch("/api/auth/wallet/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message
      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to RealityPicks with your wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
        nonce,
      });

      // 3. Sign with wallet
      const signature = await signMessageAsync({ message });

      // 4. Verify signature on server
      setPhase("verifying");
      const verifyRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        throw new Error(data.error || "Signature verification failed");
      }

      const { address: verifiedAddress } = await verifyRes.json();

      // 5. Create NextAuth session via CredentialsProvider
      const result = await signIn("wallet", {
        walletAddress: verifiedAddress,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // 6. Success — poll for session confirmation, then redirect
      setPhase("success");
      sessionStorage.removeItem("wallet-signing");

      // Force a session update and let the useEffect handle the redirect
      await waitForSession();

      // Fallback: if polling didn't trigger redirect, hard-navigate anyway
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setError("Signature request was cancelled.");
      } else {
        setError(msg);
      }
      setPhase("error");
      signingRef.current = false;
      sessionStorage.removeItem("wallet-signing");
    }
  }, [address, chain, signMessageAsync, waitForSession]);

  // Auto-trigger sign-in once when wallet connects
  // Debounced by 1 second to let session status settle after page load
  useEffect(() => {
    if (
      isConnected &&
      address &&
      chain &&
      phase === "idle" &&
      !signingRef.current &&
      status !== "authenticated" &&
      status !== "loading" &&
      !sessionStorage.getItem("wallet-signing")
    ) {
      const timer = setTimeout(() => {
        // Re-check conditions after debounce
        if (!signingRef.current && phase === "idle") {
          sessionStorage.setItem("wallet-signing", "1");
          handleSignIn();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, address, chain, phase, status, handleSignIn]);

  // Connected — show sign-in flow
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
              signingRef.current = false;
              sessionStorage.removeItem("wallet-signing");
            }}
            className="text-xs text-muted-foreground hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>

        {phase === "idle" && (
          <button
            onClick={handleSignIn}
            className="w-full rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3 text-sm font-semibold text-white hover:bg-neon-cyan/10 transition-all"
          >
            Sign Message to Continue
          </button>
        )}

        {phase === "signing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
            <span>Approve the signature in your wallet...</span>
          </div>
        )}

        {phase === "verifying" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
            <span>Verifying...</span>
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
              onClick={() => {
                signingRef.current = false;
                sessionStorage.removeItem("wallet-signing");
                handleSignIn();
              }}
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
