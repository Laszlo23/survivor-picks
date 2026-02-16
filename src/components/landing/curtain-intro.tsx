"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export function CurtainIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "done">("idle");

  const handleEnter = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("opening");
    setTimeout(() => {
      setPhase("done");
      onEnter();
    }, 1400);
  }, [phase, onEnter]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-500 ${
        phase === "opening" ? "pointer-events-none" : ""
      }`}
      style={{ opacity: phase === "opening" ? 0 : 1, transitionDelay: phase === "opening" ? "1s" : "0s" }}
    >
      {/* Left curtain */}
      <div
        className={`curtain-panel curtain-left ${phase === "opening" ? "curtain-open-left" : ""}`}
      >
        <div className="curtain-folds" />
      </div>

      {/* Right curtain */}
      <div
        className={`curtain-panel curtain-right ${phase === "opening" ? "curtain-open-right" : ""}`}
      >
        <div className="curtain-folds" />
      </div>

      {/* Curtain valance (top drape) */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-[#4a0000] via-[#6b0000] to-transparent z-20" />

      {/* Center content */}
      <div
        className={`relative z-30 text-center px-6 transition-all duration-700 ${
          phase === "opening" ? "scale-110 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Spotlight glow */}
        <div className="absolute inset-0 -m-32 bg-[radial-gradient(ellipse_at_center,hsl(45_100%_60%/0.08)_0%,transparent_60%)]" />

        <div className="relative">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="RealityPicks"
                width={80}
                height={80}
                className="rounded-2xl relative z-10 drop-shadow-[0_0_30px_hsl(45_100%_55%/0.5)]"
                style={{ mixBlendMode: "screen" }}
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-2xl scale-[2.5]" />
            </div>
          </div>

          {/* Title */}
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-amber-400/80 mb-3">
            Reality Picks
          </p>

          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.8)]">
            The Stage Is Set
          </h1>

          {/* Enter button */}
          <button
            onClick={handleEnter}
            className="mt-8 sm:mt-10 group relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-headline text-lg sm:text-xl font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {/* Button glow background */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-2 border-red-500/40 shadow-[0_0_30px_hsl(0_70%_40%/0.4),inset_0_1px_0_hsl(0_50%_70%/0.2)] group-hover:shadow-[0_0_50px_hsl(0_70%_40%/0.6),inset_0_1px_0_hsl(0_50%_70%/0.3)] transition-shadow duration-300" />
            <span className="relative">Enter The Show</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .curtain-panel {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 52%;
          z-index: 10;
          background: linear-gradient(
            180deg,
            #4a0000 0%,
            #8b0000 8%,
            #a51c1c 20%,
            #8b0000 40%,
            #6b0000 60%,
            #8b0000 80%,
            #4a0000 100%
          );
          transition: transform 1.2s cubic-bezier(0.65, 0, 0.35, 1);
        }

        .curtain-left {
          left: 0;
          border-right: 2px solid #3a0000;
        }

        .curtain-right {
          right: 0;
          border-left: 2px solid #3a0000;
        }

        .curtain-folds {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            rgba(0, 0, 0, 0.15) 8px,
            transparent 16px,
            rgba(139, 0, 0, 0.1) 24px,
            transparent 32px,
            rgba(0, 0, 0, 0.1) 40px,
            transparent 48px
          );
          pointer-events: none;
        }

        .curtain-open-left {
          transform: translateX(-105%);
        }

        .curtain-open-right {
          transform: translateX(105%);
        }
      `}</style>
    </div>
  );
}
