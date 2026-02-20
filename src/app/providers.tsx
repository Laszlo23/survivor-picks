"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ReferralCapture } from "@/components/social/referral-capture";
import { FarcasterProvider } from "@/lib/farcaster/provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FarcasterProvider>
        <TooltipProvider>
          <Suspense fallback={null}>
            <ReferralCapture />
          </Suspense>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </FarcasterProvider>
    </AuthProvider>
  );
}
