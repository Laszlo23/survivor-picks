import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ── Broadcast neon palette ─────────────────────────────── */
        "neon-cyan": "hsl(var(--neon-cyan))",
        "neon-magenta": "hsl(var(--neon-magenta))",
        "neon-gold": "hsl(var(--neon-gold))",
        "studio-black": "hsl(var(--studio-black))",
        "studio-dark": "hsl(var(--studio-dark))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        headline: [
          "var(--font-headline)",
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "torch-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 15px hsl(185 100% 55% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(185 100% 55% / 0.4)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        /* ── Broadcast keyframes ────────────────────────────────── */
        "pulse-neon": {
          "0%, 100%": { boxShadow: "0 0 8px hsl(var(--neon-cyan) / 0.4), 0 0 24px hsl(var(--neon-cyan) / 0.1)" },
          "50%": { boxShadow: "0 0 16px hsl(var(--neon-cyan) / 0.6), 0 0 48px hsl(var(--neon-cyan) / 0.2)" },
        },
        "broadcast-slide": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        torch: "torch-flicker 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "gradient-x": "gradient-x 6s ease infinite",
        "pulse-neon": "pulse-neon 2.5s ease-in-out infinite",
        "broadcast-slide": "broadcast-slide 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
      },
      boxShadow: {
        glow: "0 0 20px hsl(185 100% 55% / 0.3), 0 0 60px hsl(185 100% 55% / 0.1)",
        "glow-lg":
          "0 0 30px hsl(185 100% 55% / 0.4), 0 0 80px hsl(185 100% 55% / 0.15)",
        "glow-accent":
          "0 0 20px hsl(30 80% 50% / 0.3), 0 0 60px hsl(30 80% 50% / 0.1)",
        "glow-blue":
          "0 0 20px hsl(220 80% 55% / 0.3), 0 0 60px hsl(220 80% 55% / 0.1)",
        /* ── Neon glow shadows ──────────────────────────────────── */
        "neon-cyan":
          "0 0 12px hsl(185 100% 55% / 0.4), 0 0 40px hsl(185 100% 55% / 0.15)",
        "neon-cyan-lg":
          "0 0 20px hsl(185 100% 55% / 0.5), 0 0 60px hsl(185 100% 55% / 0.2), 0 0 100px hsl(185 100% 55% / 0.1)",
        "neon-magenta":
          "0 0 12px hsl(320 100% 60% / 0.4), 0 0 40px hsl(320 100% 60% / 0.15)",
        "neon-gold":
          "0 0 12px hsl(45 100% 55% / 0.4), 0 0 40px hsl(45 100% 55% / 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
