"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFarcaster } from "@/lib/farcaster/provider";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  Coins,
  Sparkles,
  User,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Picks", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
  { href: "/nfts", label: "NFTs", icon: Sparkles },
  { href: "/token", label: "$PICKS", icon: Coins },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomTabs() {
  const pathname = usePathname();
  const { status } = useSession();
  const { isInMiniApp } = useFarcaster();

  // Inside a Farcaster Mini App: always show tabs (auto-auth will resolve)
  // Standalone web: require authentication and hide on landing/auth/admin pages
  if (!isInMiniApp) {
    if (status !== "authenticated") return null;
    if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-white/[0.06] pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-tab-active"
                    className="absolute inset-x-2 -top-0.5 h-0.5 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 12px hsl(185 100% 55% / 0.5)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
