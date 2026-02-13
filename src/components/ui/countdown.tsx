"use client";

import { useEffect, useState } from "react";

function getTimeRemaining(targetDate: Date) {
  const total = targetDate.getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
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
      <span className="text-amber-400 font-semibold text-sm">Locked</span>
    );
  }

  return (
    <div className="flex gap-1.5 text-sm font-mono">
      {time.days > 0 && (
        <span className="bg-secondary rounded px-1.5 py-0.5 text-foreground">
          {time.days}d
        </span>
      )}
      <span className="bg-secondary rounded px-1.5 py-0.5 text-foreground">
        {String(time.hours).padStart(2, "0")}h
      </span>
      <span className="bg-secondary rounded px-1.5 py-0.5 text-foreground">
        {String(time.minutes).padStart(2, "0")}m
      </span>
      <span className="bg-secondary rounded px-1.5 py-0.5 text-primary">
        {String(time.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}
