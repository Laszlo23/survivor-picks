"use client";

import { useState, useEffect, type ReactNode } from "react";
import { CurtainIntro } from "./curtain-intro";

const CURTAIN_KEY = "rp-curtain-seen";

export function LandingShell({ children }: { children: ReactNode }) {
  const [showCurtain, setShowCurtain] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(CURTAIN_KEY);
    if (seen) {
      setEntered(true);
    } else {
      setShowCurtain(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem(CURTAIN_KEY, "1");
    setEntered(true);
  };

  return (
    <>
      {showCurtain && !entered && <CurtainIntro onEnter={handleEnter} />}

      <div
        className={`transition-opacity duration-700 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
