"use client";

import { Suspense, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ReferralCapture } from "@/components/social/referral-capture";
import { FarcasterProvider } from "@/lib/farcaster/provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
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
  );
}
