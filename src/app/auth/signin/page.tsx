"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { Mail, Zap, Shield, Check } from "lucide-react";
import { FadeIn, ScaleIn, PressScale } from "@/components/motion";

const IS_DEV = process.env.NODE_ENV !== "production";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSent(true);
    setLoading(false);
  };

  const handleDevLogin = async (
    devEmail: string,
    name: string,
    role: "USER" | "ADMIN"
  ) => {
    setDevLoading(devEmail);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: devEmail, name, role }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } catch {
      alert("Dev login failed \u2014 is the database running?");
    } finally {
      setDevLoading(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,hsl(185_80%_12%/0.3)_0%,transparent_60%)]" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Main sign-in card */}
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
                <CardTitle className="text-2xl font-display">Sign In</CardTitle>
              </FadeIn>
              <FadeIn delay={0.25}>
                <CardDescription>
                  Enter your email to receive a magic sign-in link
                </CardDescription>
              </FadeIn>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center"
                    >
                      <Check className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-display font-semibold mb-2">
                      Check your email!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We sent a sign-in link to <strong>{email}</strong>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FadeIn delay={0.3}>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/[0.03] border-white/[0.08] focus:border-primary/30"
                          />
                        </div>
                      </FadeIn>
                      <FadeIn delay={0.4}>
                        <PressScale>
                          <Button
                            type="submit"
                            className="w-full shadow-glow"
                            disabled={loading}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {loading ? "Sending..." : "Send Magic Link"}
                          </Button>
                        </PressScale>
                      </FadeIn>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Dev access card */}
        {IS_DEV && (
          <FadeIn delay={0.5}>
            <Card className="border-amber-500/20 bg-amber-500/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                  <Zap className="h-4 w-4" />
                  Dev Quick Access
                </CardTitle>
                <CardDescription className="text-xs">
                  Instant login \u2014 no email needed. Only visible in development.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-amber-500/15 hover:bg-amber-500/10 hover:text-amber-300"
                  onClick={() =>
                    handleDevLogin("admin@realitypicks.xyz", "Admin", "ADMIN")
                  }
                  disabled={devLoading !== null}
                >
                  <Shield className="h-4 w-4 text-amber-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {devLoading === "admin@realitypicks.xyz"
                        ? "Logging in..."
                        : "Login as Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      admin@realitypicks.xyz
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-primary/15 hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    handleDevLogin("player@realitypicks.xyz", "Test Player", "USER")
                  }
                  disabled={devLoading !== null}
                >
                  <Image src="/logo.png" alt="" width={16} height={16} className="rounded" style={{ mixBlendMode: "screen" }} />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {devLoading === "player@realitypicks.xyz"
                        ? "Logging in..."
                        : "Login as Player"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      player@realitypicks.xyz
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
