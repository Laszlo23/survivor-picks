"use client";

import { motion } from "framer-motion";

interface LowerThirdProps {
  label: string;
  value: string;
  className?: string;
}

export function LowerThird({ label, value, className = "" }: LowerThirdProps) {
  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative border-l-[3px] border-neon-cyan bg-studio-dark/80 backdrop-blur-sm pl-4 pr-6 py-2.5 ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-cyan mb-0.5">
        {label}
      </p>
      <p className="text-base font-headline font-bold text-white leading-tight sm:text-lg">
        {value}
      </p>
    </motion.div>
  );
}
