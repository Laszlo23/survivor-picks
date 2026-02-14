"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useConnect, useAccount } from "wagmi";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FarcasterContext = {
  /** Whether the app is currently running inside a Farcaster Mini App */
  isInMiniApp: boolean;
  /** Farcaster user ID (null if not in Mini App or not yet loaded) */
  fid: number | null;
  /** Farcaster username */
  username: string | null;
  /** Farcaster profile picture URL */
  pfpUrl: string | null;
  /** Whether the SDK has finished initializing */
  isReady: boolean;
  /** Compose a cast from within the Mini App */
  composeCast: (text: string, embeds?: string[]) => Promise<void>;
  /** Swap tokens via the native Farcaster swap UI */
  swapToken: (tokenAddress: string) => Promise<void>;
};

const defaultCtx: FarcasterContext = {
  isInMiniApp: false,
  fid: null,
  username: null,
  pfpUrl: null,
  isReady: false,
  composeCast: async () => {},
  swapToken: async () => {},
};

const FarcasterCtx = createContext<FarcasterContext>(defaultCtx);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<FarcasterContext>(defaultCtx);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Dynamically import to avoid breaking SSR / standalone web builds
        const { sdk } = await import("@farcaster/miniapp-sdk");

        // Attempt to get context -- this will throw or return null
        // if we're not running inside a Farcaster client
        const context = await sdk.context;

        if (cancelled) return;

        if (context?.user) {
          // We're inside a Farcaster Mini App
          const fid = context.user.fid;
          const username = context.user.username ?? null;
          const pfpUrl = context.user.pfpUrl ?? null;

          // Auto-connect wallet via the farcaster miniapp connector
          if (!isConnected) {
            const fcConnector = connectors.find(
              (c) => c.id === "farcasterMiniApp" || c.name === "Farcaster"
            );
            if (fcConnector) {
              try {
                connect({ connector: fcConnector });
              } catch (e) {
                console.warn("[Farcaster] Auto-connect failed:", e);
              }
            }
          }

          // Bridge Farcaster auth to NextAuth session
          if (sessionStatus !== "authenticated") {
            try {
              const { token } = await sdk.quickAuth.getToken();
              await fetch("/api/auth/farcaster", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });
            } catch (e) {
              console.warn("[Farcaster] Quick Auth bridge failed:", e);
            }
          }

          setCtx({
            isInMiniApp: true,
            fid,
            username,
            pfpUrl,
            isReady: true,
            composeCast: async (text: string, embeds?: string[]) => {
              try {
                const castParams: { text: string; embeds?: [string] | [string, string] } = { text };
                if (embeds && embeds.length > 0) {
                  castParams.embeds = embeds.slice(0, 2) as [string] | [string, string];
                }
                await sdk.actions.composeCast(castParams);
              } catch (e) {
                console.warn("[Farcaster] composeCast failed:", e);
              }
            },
            swapToken: async (tokenAddress: string) => {
              try {
                // CAIP-19 format for Base ERC-20 tokens
                const buyToken = `eip155:8453/erc20:${tokenAddress}`;
                await sdk.actions.swapToken({ buyToken });
              } catch (e) {
                console.warn("[Farcaster] swapToken failed:", e);
              }
            },
          });

          // Signal to the host that the app is ready
          await sdk.actions.ready();
        } else {
          // We have the SDK but no user context -- still call ready()
          await sdk.actions.ready();
          setCtx((prev) => ({ ...prev, isReady: true }));
        }
      } catch {
        // Not inside a Farcaster Mini App -- standalone web mode
        if (!cancelled) {
          setCtx((prev) => ({ ...prev, isReady: true }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FarcasterCtx.Provider value={ctx}>{children}</FarcasterCtx.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFarcaster() {
  return useContext(FarcasterCtx);
}
