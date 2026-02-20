"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth-context";

type FarcasterContext = {
  isInMiniApp: boolean;
  fid: number | null;
  username: string | null;
  pfpUrl: string | null;
  isReady: boolean;
  composeCast: (text: string, embeds?: string[]) => Promise<void>;
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

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<FarcasterContext>(defaultCtx);
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof window !== "undefined" && window.parent === window && !window.opener) {
          if (!cancelled) setCtx((prev) => ({ ...prev, isReady: true }));
          return;
        }

        const { sdk } = await import("@farcaster/miniapp-sdk");

        const context = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);

        if (cancelled) return;

        const fid = context?.user?.fid;
        const isRealMiniApp =
          typeof fid === "number" && fid > 0 && Number.isInteger(fid);

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

          if (sessionStatus !== "authenticated") {
            try {
              const { token } = await sdk.quickAuth.getToken();
              const res = await fetch("/api/auth/farcaster", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
              });
              if (res.ok && typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-change"));
              }
            } catch (e) {
              console.warn("[Farcaster] Quick Auth bridge failed:", e);
            }
          }
        } else {
          setCtx((prev) => ({ ...prev, isReady: true }));
        }
      } catch {
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

export function useFarcaster() {
  return useContext(FarcasterCtx);
}
