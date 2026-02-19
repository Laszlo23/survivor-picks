"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Trophy } from "lucide-react";

interface WinCelebrationProps {
  amount: string;
  betPrompt: string;
  onDismiss: () => void;
}

// Gold confetti particle
function Confetti({ delay, x }: { delay: number; x: number }) {
  const size = 4 + Math.random() * 6;
  const rotation = Math.random() * 360;
  const duration = 2 + Math.random() * 2;
  const isGold = Math.random() > 0.3;

  return (
    <motion.div
      initial={{
        x: `${x}vw`,
        y: "-10vh",
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: "110vh",
        rotate: rotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: "linear",
      }}
      className="fixed z-[60] pointer-events-none"
      style={{
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        background: isGold
          ? `hsl(${40 + Math.random() * 20} ${80 + Math.random() * 20}% ${50 + Math.random() * 20}%)`
          : `hsl(${185 + Math.random() * 20} 80% 60%)`,
        boxShadow: isGold
          ? "0 0 4px hsl(45 100% 55% / 0.5)"
          : "0 0 4px hsl(185 100% 55% / 0.5)",
      }}
    />
  );
}

export function WinCelebration({
  amount,
  betPrompt,
  onDismiss,
}: WinCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const particles = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.8,
        x: Math.random() * 100,
      })),
    []
  );

  return (
    <>
      {/* Confetti particles */}
      {particles.map((p) => (
        <Confetti key={p.id} delay={p.delay} x={p.x} />
      ))}

      {/* Center overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          {/* Trophy icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mx-auto mb-3"
          >
            <Trophy className="h-16 w-16 text-amber-400 drop-shadow-[0_0_20px_hsl(45_100%_55%/0.5)]" />
          </motion.div>

          {/* Win amount */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-headline font-black text-neon-gold drop-shadow-[0_0_30px_hsl(45_100%_55%/0.5)]"
          >
            +{parseInt(amount).toLocaleString()}
          </motion.div>

          <p className="text-lg font-headline font-bold text-white/80 mt-1">
            $PICKS WON
          </p>

          <p className="text-xs text-white/30 mt-2 max-w-[250px] mx-auto">
            {betPrompt}
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}
