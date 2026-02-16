"use client";

import Image from "next/image";
import { Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FadeIn, ScaleIn } from "@/components/motion";
import { WalletSignIn } from "@/components/auth/wallet-sign-in";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,hsl(185_80%_12%/0.3)_0%,transparent_60%)]" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        <ScaleIn>
          <Card className="border-white/[0.08]">
            <CardHeader className="text-center">
              <FadeIn delay={0.1}>
                <div className="mx-auto mb-4 relative">
                  <Image
                    src="/logo.png"
                    alt="RealityPicks"
                    width={64}
                    height={64}
                    className="rounded-xl relative z-10"
                    style={{ mixBlendMode: "screen" }}
                  />
                  <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-xl scale-150" />
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <CardTitle className="text-2xl font-display">
                  Sign In
                </CardTitle>
              </FadeIn>
              <FadeIn delay={0.25}>
                <CardDescription>
                  Connect your wallet to get started
                </CardDescription>
              </FadeIn>
            </CardHeader>
            <CardContent>
              <FadeIn delay={0.3}>
                <WalletSignIn />
              </FadeIn>

              {/* Trust badges */}
              <FadeIn delay={0.4}>
                <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Non-custodial
                  </span>
                  <span className="text-white/10">|</span>
                  <span>No email needed</span>
                  <span className="text-white/10">|</span>
                  <span>Base network</span>
                </div>
              </FadeIn>
            </CardContent>
          </Card>
        </ScaleIn>
      </div>
    </div>
  );
}
