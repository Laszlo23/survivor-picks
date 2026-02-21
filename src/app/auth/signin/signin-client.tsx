"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Mail,
  Coins,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  Gift,
  CheckCircle,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FadeIn, ScaleIn } from "@/components/motion";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "otp";

export function SignInClient() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocalhost(host === "localhost" || host === "127.0.0.1");
  }, []);

  useEffect(() => {
    if (step === "otp" && otpRef.current) {
      otpRef.current.focus();
    }
  }, [step]);

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (data?.success) {
        window.location.href = "/dashboard";
        return;
      }
      setError(data?.error || "Dev login failed");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data?.success) {
        setError(data?.error || "Failed to send code. Please try again.");
        return;
      }

      setStep("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")
          ? "Network error. Check your connection and try again."
          : msg || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 6) {
      setError("Please enter the code from your email.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const supabase = createClient();

      // Try magiclink type first, then signup, then email
      const types = ["magiclink", "signup", "email"] as const;
      let success = false;

      for (const type of types) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type,
        });
        if (!verifyError) {
          success = true;
          break;
        }
      }

      if (!success) {
        setError("Invalid or expired code. Please try again.");
        setVerifying(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Verification failed. Please try again.");
      setVerifying(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,hsl(185_80%_12%/0.3)_0%,transparent_60%)]" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        <ScaleIn>
          <Card className="border-white/[0.08] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-gold" />

            <CardHeader className="text-center pb-2">
              <FadeIn delay={0.1}>
                <div className="mx-auto mb-4 relative">
                  <Image
                    src="/pickslogoicon.png"
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
                  Welcome to RealityPicks
                </CardTitle>
              </FadeIn>
              <FadeIn delay={0.25}>
                <CardDescription>
                  Join the 333 community — get your $PICKS wallet instantly
                </CardDescription>
              </FadeIn>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Signup perks */}
              <FadeIn delay={0.28}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Gift, label: "33,333 $PICKS", sub: "Free bonus" },
                    { icon: CreditCard, label: "Buy with Card", sub: "Stripe powered" },
                    { icon: Shield, label: "No Wallet", sub: "Required" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                    >
                      <Icon className="h-4 w-4 text-neon-cyan" />
                      <p className="text-[10px] font-bold text-white text-center leading-tight">
                        {label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Auth flow */}
              <FadeIn delay={0.3}>
                {step === "otp" ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-3">
                      <div className="flex items-center gap-2 text-neon-cyan mb-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold text-sm">Code sent!</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We sent a code to{" "}
                        <strong className="text-white">{email}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                          {error}
                        </p>
                      )}
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          ref={otpRef}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={8}
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                          }
                          placeholder="Enter code from email"
                          required
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-center text-lg font-mono tracking-[0.3em] text-white placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={verifying || otpCode.length < 6 || otpCode.length > 8}
                        className="w-full rounded-lg bg-neon-cyan text-studio-black font-bold text-sm py-3 hover:bg-neon-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Signing in…
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Sign in
                          </>
                        )}
                      </button>
                    </form>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setOtpCode("");
                          setError(null);
                        }}
                        className="text-xs text-neon-cyan hover:underline"
                      >
                        Use a different email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode("");
                          setError(null);
                          handleSendCode(
                            new Event("submit") as unknown as React.FormEvent
                          );
                        }}
                        disabled={loading}
                        className="text-xs text-muted-foreground hover:text-white transition-colors"
                      >
                        {loading ? "Sending…" : "Resend code"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendCode} className="space-y-3">
                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">
                      Enter your email — we&apos;ll send you a sign-in code. No
                      password needed.
                    </p>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full rounded-lg bg-neon-cyan text-studio-black font-bold text-sm py-3 hover:bg-neon-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending code…
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Send sign-in code
                        </>
                      )}
                    </button>
                    {isLocalhost && (
                      <button
                        type="button"
                        onClick={handleDevLogin}
                        disabled={loading || !email.trim()}
                        className="w-full rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-400 text-xs py-2 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Instant login (dev only — skips email)
                      </button>
                    )}
                  </form>
                )}
              </FadeIn>

              {/* Value prop */}
              <FadeIn delay={0.35}>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-neon-gold/20 bg-neon-gold/5 px-3 py-2">
                  <Coins className="h-4 w-4 text-neon-gold" />
                  <span className="text-xs text-neon-gold font-semibold">
                    The 333 Launch &bull; 1 $PICKS = $0.00333
                  </span>
                </div>
              </FadeIn>

              {/* Trust line */}
              <FadeIn delay={0.4}>
                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1">
                  <span>Instant wallet</span>
                  <span className="text-white/10">|</span>
                  <span>Buy with Stripe</span>
                </div>
              </FadeIn>
            </CardContent>
          </Card>
        </ScaleIn>
      </div>
    </div>
  );
}
