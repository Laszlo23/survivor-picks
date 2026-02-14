"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getTimeRemaining(targetDate: Date) {
  const total = targetDate.getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}

function TickDigit({ value }: { value: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function Countdown({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.total <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
        Locked
      </span>
    );
  }

  return (
    <div className="flex gap-1 text-sm font-mono">
      {time.days > 0 && (
        <span className="bg-secondary/80 rounded-md px-1.5 py-0.5 text-foreground">
          {time.days}d
        </span>
      )}
      <span className="bg-secondary/80 rounded-md px-1.5 py-0.5 text-foreground">
        <TickDigit value={String(time.hours).padStart(2, "0")} />h
      </span>
      <span className="bg-secondary/80 rounded-md px-1.5 py-0.5 text-foreground">
        <TickDigit value={String(time.minutes).padStart(2, "0")} />m
      </span>
      <span className="bg-secondary/80 rounded-md px-1.5 py-0.5 text-primary font-bold">
        <TickDigit value={String(time.seconds).padStart(2, "0")} />s
      </span>
    </div>
  );
}
