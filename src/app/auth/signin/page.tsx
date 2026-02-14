"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
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
import { Mail, Zap, Shield } from "lucide-react";

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
        // Full page navigation so NextAuth session picks up the new cookie
        window.location.href = "/dashboard";
      }
    } catch {
      alert("Dev login failed — is the database running?");
    } finally {
      setDevLoading(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Main sign-in card */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Image src="/logo.png" alt="RealityPicks" width={64} height={64} className="rounded-xl" />
            </div>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email to receive a magic sign-in link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-4">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Check your email!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We sent a sign-in link to <strong>{email}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Dev access card — only in development */}
        {IS_DEV && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                <Zap className="h-4 w-4" />
                Dev Quick Access
              </CardTitle>
              <CardDescription className="text-xs">
                Instant login — no email needed. Only visible in development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-300"
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
                    admin@realitypicks.xyz — full access
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-primary/20 hover:bg-primary/10 hover:text-primary"
                onClick={() =>
                  handleDevLogin("player@realitypicks.xyz", "Test Player", "USER")
                }
                disabled={devLoading !== null}
              >
                <Image src="/logo.png" alt="" width={16} height={16} className="rounded" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {devLoading === "player@realitypicks.xyz"
                      ? "Logging in..."
                      : "Login as Player"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    player@realitypicks.xyz — regular user
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
