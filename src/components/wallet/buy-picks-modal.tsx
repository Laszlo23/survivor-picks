"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Loader2,
  Check,
  Sparkles,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import { TOKEN_PACKAGES } from "@/lib/picks-config";

const PACKAGE_ICONS = [Zap, Star, Sparkles, Crown];

interface BuyPicksModalProps {
  open: boolean;
  onClose: () => void;
}

export function BuyPicksModal({ open, onClose }: BuyPicksModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePurchase(packageId: string) {
    setLoading(packageId);
    try {
      const returnTo = typeof window !== "undefined" ? window.location.pathname || "/profile" : "/profile";
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, returnTo }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[201] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-studio-dark shadow-2xl"
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>

                <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-bold mb-3">
                  <CreditCard className="h-3 w-3" />
                  Buy with Credit Card
                </div>
                <h2 className="text-xl font-display font-bold text-white">
                  Get $PICKS Tokens
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  1 $PICKS = $0.00<span className="text-neon-gold font-bold">333</span> USD &bull; The 333 Fair Launch
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {TOKEN_PACKAGES.map((pkg, i) => {
                  const Icon = PACKAGE_ICONS[i];
                  const isLoading = loading === pkg.id;

                  return (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={!!loading}
                      className={`relative group text-left p-4 rounded-xl border transition-all ${
                        pkg.popular
                          ? "border-neon-cyan/30 bg-neon-cyan/[0.05] shadow-[0_0_20px_hsl(185_100%_55%/0.08)]"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-neon-cyan text-studio-black text-[9px] font-bold uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            pkg.popular
                              ? "bg-neon-cyan/15 text-neon-cyan"
                              : "bg-white/[0.05] text-white/60"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">
                            {pkg.label}
                          </p>
                          <p className="text-lg font-mono font-bold text-neon-cyan mt-0.5">
                            {pkg.picks.toLocaleString()}
                            <span className="text-xs text-white/40 ml-1">
                              $PICKS
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${pkg.priceUsd.toFixed(2)} USD
                          </p>
                        </div>
                      </div>

                      <div
                        className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                          pkg.popular
                            ? "bg-neon-cyan text-studio-black"
                            : "bg-white/[0.06] text-white/80 group-hover:bg-white/[0.1]"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            Buy Now
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-400" />
                  Secure Stripe Checkout
                </span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-400" />
                  Instant Delivery
                </span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-400" />
                  1:1 On-Chain Exchange
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
      )}
    </AnimatePresence>
  );
}
