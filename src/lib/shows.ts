/**
 * Client-safe show configuration.
 * THE single source of truth for all show UI — used everywhere:
 * ShowTabs, PredictionFeed, PredictionCard, landing page, onboarding.
 * Does NOT import Prisma or server-only modules.
 */

export interface ShowInfo {
  slug: string;
  name: string;
  shortName: string;
  network: string;
  emoji: string;
  /** Tailwind gradient classes for card background */
  gradient: string;
  /** Deeper gradient for landing page cards */
  landingGradient: string;
  /** Tailwind border color */
  border: string;
  /** Tailwind badge classes */
  badge: string;
  /** Accent hex color for selection highlights */
  accent: string;
  /** Glow color key for GlowCard on landing */
  glowColor: "primary" | "accent" | "blue";
  /** Tailwind gradient for card header accent bar */
  headerGradient: string;
  status: string;
  tagline: string;
  categories: string[];
  /** Atmospheric vibe text for the feed when this show is active */
  vibeText: string;
  /** Show-specific empty state title */
  emptyTitle: string;
  /** Show-specific empty state description */
  emptyDescription: string;
}

export const LIVE_SHOWS: ShowInfo[] = [
  {
    slug: "survivor-2026",
    name: "Survivor 2026: All Star",
    shortName: "Survivor TR",
    network: "TV8",
    emoji: "\uD83C\uDFDD\uFE0F",
    gradient: "from-orange-900/40 to-amber-900/40",
    landingGradient: "from-orange-950/50 to-amber-950/50",
    border: "border-orange-700/30",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/20",
    accent: "#fb923c",
    glowColor: "accent",
    headerGradient: "from-orange-500/20 via-orange-500/5 to-transparent",
    status: "Airing Now",
    tagline: "All Stars vs Volunteers. Dominican Republic. Who survives?",
    categories: ["Immunity", "Elimination", "Reward", "Council"],
    vibeText: "The island is calling. Unluler vs Gonulluler -- who will survive?",
    emptyTitle: "The island awaits your predictions...",
    emptyDescription: "New predictions drop when the next episode airs on TV8.",
  },
  {
    slug: "survivor-50",
    name: "Survivor 50",
    shortName: "Survivor US",
    network: "CBS",
    emoji: "\uD83C\uDFDD\uFE0F",
    gradient: "from-emerald-900/40 to-green-900/40",
    landingGradient: "from-emerald-950/50 to-green-950/50",
    border: "border-emerald-700/30",
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
    accent: "#34d399",
    glowColor: "primary",
    headerGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    status: "Premieres Feb 25",
    tagline: "The ultimate test of will. 50 seasons of legacy.",
    categories: ["Immunity", "Elimination", "Alliances", "Idols"],
    vibeText: "The torch is lit. Who will outwit, outplay, outlast?",
    emptyTitle: "The tribe awaits your predictions...",
    emptyDescription: "Tribal Council hasn't opened yet. New predictions drop when the next episode is announced.",
  },
  {
    slug: "traitors-us-4",
    name: "The Traitors US",
    shortName: "Traitors",
    network: "Peacock",
    emoji: "\uD83D\uDDE1\uFE0F",
    gradient: "from-red-900/40 to-rose-900/40",
    landingGradient: "from-red-950/50 to-rose-950/50",
    border: "border-red-700/30",
    badge: "bg-red-500/20 text-red-400 border border-red-500/20",
    accent: "#f87171",
    glowColor: "accent",
    headerGradient: "from-red-500/20 via-red-500/5 to-transparent",
    status: "Airing Now",
    tagline: "Trust no one. Season 4 is live now.",
    categories: ["Murder", "Banishment", "Missions", "Reveals"],
    vibeText: "The castle holds secrets. Who do you trust?",
    emptyTitle: "The castle is quiet... for now",
    emptyDescription: "No missions announced yet. The Roundtable will reconvene when the next episode opens.",
  },
  {
    slug: "bachelor-2026",
    name: "The Bachelor",
    shortName: "Bachelor",
    network: "ABC",
    emoji: "\uD83C\uDF39",
    gradient: "from-pink-900/40 to-fuchsia-900/40",
    landingGradient: "from-pink-950/50 to-fuchsia-950/50",
    border: "border-pink-700/30",
    badge: "bg-pink-500/20 text-pink-400 border border-pink-500/20",
    accent: "#f472b6",
    glowColor: "blue",
    headerGradient: "from-pink-500/20 via-pink-500/5 to-transparent",
    status: "Winter 2026",
    tagline: "Will love prevail? Predict every rose ceremony.",
    categories: ["Rose Ceremony", "Group Date", "1-on-1", "Drama"],
    vibeText: "The roses are ready. Who gets the final rose?",
    emptyTitle: "The roses are waiting...",
    emptyDescription: "No rose ceremony announced yet. Predictions open when the next episode drops.",
  },
];

export function getShowBySlug(slug: string): ShowInfo | undefined {
  return LIVE_SHOWS.find((s) => s.slug === slug);
}

export function getDefaultShow(): ShowInfo {
  return LIVE_SHOWS[0];
}
