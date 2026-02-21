"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-context";
import { useFarcaster } from "@/lib/farcaster/provider";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  BarChart3,
  LayoutGrid,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { WalletModal } from "@/components/wallet/wallet-modal";

interface Tab {
  href?: string;
  action?: string;
  label: string;
  icon: typeof LayoutGrid;
}

const tabs: Tab[] = [
  { href: "/play", label: "Play", icon: LayoutGrid },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { action: "wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function BottomTabs() {
  const pathname = usePathname();
  const { status } = useSession();
  const { isInMiniApp } = useFarcaster();
  const [walletOpen, setWalletOpen] = useState(false);

  if (!isInMiniApp) {
    if (status !== "authenticated") return null;
    if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-strong border-t border-white/[0.06] pb-safe">
          <div className="flex items-center justify-around px-1 h-16">
            {tabs.map((tab) => {
              const isActive = tab.href
                ? pathname === tab.href || pathname.startsWith(tab.href + "/")
                : false;
              const Icon = tab.icon;

              if (tab.action === "wallet") {
                return (
                  <button
                    key={tab.label}
                    onClick={() => setWalletOpen(true)}
                    className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2"
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
                    </motion.div>
                    <span className="text-[10px] font-medium text-muted-foreground transition-colors duration-200">
                      {tab.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href!}
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
      {walletOpen && (
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      )}
    </>
  );
}
