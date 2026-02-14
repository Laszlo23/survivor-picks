"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  href?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-neon-cyan text-studio-black font-bold shadow-neon-cyan hover:shadow-neon-cyan-lg hover:brightness-110 focus-visible:ring-neon-cyan",
  secondary:
    "border-2 border-neon-magenta/60 text-neon-magenta bg-neon-magenta/5 hover:bg-neon-magenta/15 hover:shadow-neon-magenta focus-visible:ring-neon-magenta",
  ghost:
    "text-white/80 hover:text-neon-cyan hover:bg-neon-cyan/5 focus-visible:ring-neon-cyan",
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ variant = "primary", href, fullWidth, className = "", children, ...props }, ref) => {
    const base = `inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-headline font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-studio-black disabled:opacity-50 disabled:pointer-events-none ${
      fullWidth ? "w-full" : ""
    }`;

    const classes = `${base} ${variantClasses[variant]} ${className}`;

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

NeonButton.displayName = "NeonButton";
