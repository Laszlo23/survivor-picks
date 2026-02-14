/**
 * Client-safe show configuration.
 * Used by ShowTabs, PredictionFeed, landing page, and onboarding.
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
  /** Tailwind border color */
  border: string;
  /** Tailwind badge classes */
  badge: string;
  /** Accent hex color for selection highlights */
  accent: string;
  status: string;
  tagline: string;
  categories: string[];
}

export const LIVE_SHOWS: ShowInfo[] = [
  {
    slug: "survivor-50",
    name: "Survivor 50",
    shortName: "Survivor",
    network: "CBS",
    emoji: "🏝️",
    gradient: "from-emerald-900/40 to-green-900/40",
    border: "border-emerald-700/30",
    badge: "bg-emerald-500/20 text-emerald-400",
    accent: "#34d399",
    status: "Premieres Feb 25",
    tagline: "The ultimate test of will. 50 seasons of legacy.",
    categories: ["Immunity", "Elimination", "Alliances", "Idols"],
  },
  {
    slug: "traitors-us-4",
    name: "The Traitors US",
    shortName: "Traitors",
    network: "Peacock",
    emoji: "🗡️",
    gradient: "from-red-900/40 to-rose-900/40",
    border: "border-red-700/30",
    badge: "bg-red-500/20 text-red-400",
    accent: "#f87171",
    status: "Airing Now",
    tagline: "Trust no one. Season 4 is live now.",
    categories: ["Murder", "Banishment", "Missions", "Reveals"],
  },
  {
    slug: "bachelor-2026",
    name: "The Bachelor",
    shortName: "Bachelor",
    network: "ABC",
    emoji: "🌹",
    gradient: "from-pink-900/40 to-fuchsia-900/40",
    border: "border-pink-700/30",
    badge: "bg-pink-500/20 text-pink-400",
    accent: "#f472b6",
    status: "Winter 2026",
    tagline: "Will love prevail? Predict every rose ceremony.",
    categories: ["Rose Ceremony", "Group Date", "1-on-1", "Drama"],
  },
];

export function getShowBySlug(slug: string): ShowInfo | undefined {
  return LIVE_SHOWS.find((s) => s.slug === slug);
}

export function getDefaultShow(): ShowInfo {
  return LIVE_SHOWS[0];
}
