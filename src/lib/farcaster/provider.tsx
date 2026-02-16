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
        // Quick bail-out: if we're not in an iframe, we can't be in a Mini App
        if (typeof window !== "undefined" && window.parent === window && !window.opener) {
          if (!cancelled) setCtx((prev) => ({ ...prev, isReady: true }));
          return;
        }

        // Dynamically import to avoid breaking SSR / standalone web builds
        const { sdk } = await import("@farcaster/miniapp-sdk");

        // Attempt to get context with a timeout to prevent hanging
        const context = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);

        if (cancelled) return;

        // Strict check: fid must be a positive integer to confirm real Mini App
        const fid = context?.user?.fid;
        const isRealMiniApp =
          typeof fid === "number" && fid > 0 && Number.isInteger(fid);

        // Signal to the host that the app is ready IMMEDIATELY.
        // This must happen as early as possible to dismiss the splash screen.
        // Auth bridging and wallet connection happen after.
        await sdk.actions.ready();

        if (isRealMiniApp && context?.user) {
          const username = context.user.username ?? null;
          const pfpUrl = context.user.pfpUrl ?? null;

          setCtx({
            isInMiniApp: true,
            fid: fid as number,
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
                const buyToken = `eip155:8453/erc20:${tokenAddress}`;
                await sdk.actions.swapToken({ buyToken });
              } catch (e) {
                console.warn("[Farcaster] swapToken failed:", e);
              }
            },
          });

          // Auto-connect wallet (non-blocking, after ready)
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

          // Bridge Farcaster auth to NextAuth session (non-blocking, after ready)
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
        } else {
          // SDK loaded but no user context
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
