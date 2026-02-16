"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { Mail, Check, Loader2 } from "lucide-react";

export function LandingEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're in! We'll keep you posted.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <FadeIn>
        <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-neon-cyan/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-neon-cyan" />
            </div>
          </div>
          <h3 className="font-headline text-xl font-bold uppercase text-white mb-2">
            Stay in the Loop
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get notified for new shows, prediction markets, and community drops.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-sm text-neon-cyan">
              <Check className="h-4 w-4" />
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-2.5 rounded-lg bg-neon-cyan text-studio-black text-sm font-bold uppercase tracking-wider hover:bg-neon-cyan/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="text-xs text-red-400 mt-2">{message}</p>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
