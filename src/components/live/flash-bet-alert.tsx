"use client";

import { motion } from "framer-motion";
import { Zap, X } from "lucide-react";
import { useEffect } from "react";

interface FlashBetAlertProps {
  bet: {
    id: string;
    prompt: string;
    multiplier: number;
    locksAt: string;
  };
  onDismiss: () => void;
}

export function FlashBetAlert({ bet, onDismiss }: FlashBetAlertProps) {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: -120, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -120, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
    >
      <div
        className="relative rounded-xl overflow-hidden
          bg-gradient-to-r from-amber-900/90 to-orange-900/90
          backdrop-blur-xl border-2 border-neon-gold/40
          shadow-[0_0_40px_hsl(45_100%_55%/0.3),0_0_80px_hsl(45_100%_55%/0.1)]"
      >
        {/* Animated neon border */}
        <div className="absolute inset-0 rounded-xl animate-pulse-neon pointer-events-none" />

        {/* Top flash badge */}
        <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-neon-gold/20">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
            </motion.div>
            <span className="text-xs font-headline font-black text-amber-300 uppercase tracking-[0.2em]">
              Flash Bet
            </span>
            {bet.multiplier > 1 && (
              <span className="text-[10px] font-bold text-black bg-amber-400 rounded px-1.5 py-0.5">
                {bet.multiplier}x
              </span>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/70 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bet prompt */}
        <div className="px-4 py-3">
          <p className="text-base font-headline font-bold text-white leading-tight">
            {bet.prompt}
          </p>
          <p className="text-[10px] text-amber-300/60 mt-1">
            Scroll down to place your bet before time runs out!
          </p>
        </div>

        {/* Progress bar countdown */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: 8,
            ease: "linear",
          }}
          className="h-1 bg-gradient-to-r from-amber-400 to-orange-500"
        />
      </div>
    </motion.div>
  );
}
