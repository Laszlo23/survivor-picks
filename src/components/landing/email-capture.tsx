"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { Gift, Check, Loader2, Bell } from "lucide-react";

export function LandingEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/claim/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Check your inbox for the sign-in link. Your 33,333 $PICKS will be credited when you sign in.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <FadeIn>
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-neon-gold/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-neon-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-0.5">
                Get 33,333 $PICKS free + show alerts
              </h3>
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <Bell className="h-3 w-3" />
                Notified when markets open, episodes air, and results drop
              </p>

              {status === "success" ? (
                <div className="flex items-center gap-2 text-sm text-neon-cyan">
                  <Check className="h-4 w-4" />
                  {message}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    required
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 px-4 py-2 rounded-lg bg-neon-cyan text-studio-black text-sm font-bold uppercase tracking-wider hover:bg-neon-cyan/90 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Claim"
                    )}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="text-xs text-red-400 mt-1.5">{message}</p>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
