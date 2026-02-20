"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Trophy,
  LayoutDashboard,
  Shield,
  LogOut,
  Coins,
  Sparkles,
  Menu,
  X,
  BookOpen,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/nfts", label: "NFTs", icon: Sparkles },
  { href: "/token", label: "$PICKS", icon: Coins },
  { href: "/profile", label: "Profile", icon: User },
];

const learnItems = [
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/tokenomics", label: "Tokenomics" },
  { href: "/contracts", label: "Contracts" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const mobileMenu = (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 bg-black/60 backdrop-blur-sm z-[9998] md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu panel */}
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-14 right-0 bottom-0 w-72 bg-studio-dark border-l border-white/[0.06] z-[9999] md:hidden overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-1">
              {/* User info (authenticated) */}
              {status === "authenticated" && session?.user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-cyan/20 text-neon-cyan text-sm font-bold ring-1 ring-neon-cyan/30">
                    {session.user.name?.[0]?.toUpperCase() ||
                      session.user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.user.name || "Player"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Sign In CTA (unauthenticated) */}
              {status === "unauthenticated" && (
                <div className="mb-4">
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full shadow-glow"
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* Nav items (authenticated only) */}
              {status === "authenticated" &&
                navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "text-neon-cyan bg-neon-cyan/[0.08] border border-neon-cyan/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}

              {/* Admin link (mobile) */}
              {status === "authenticated" &&
                session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                      pathname === "/admin"
                        ? "text-neon-gold bg-neon-gold/[0.08] border border-neon-gold/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

              {/* Divider — Learn links */}
              <div className="my-4 border-t border-white/[0.06]" />
              <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Learn
              </p>
              {learnItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? "text-neon-cyan bg-neon-cyan/[0.08]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {/* Divider — Social */}
              <div className="my-4 border-t border-white/[0.06]" />
              <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Community
              </p>
              <a
                href="https://discord.gg/Km7Tw6jHhk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Discord
                <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
              </a>
              <a
                href="https://warpcast.com/0xlaszlo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Farcaster
                <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
              </a>
              <a
                href="https://x.com/laszloleonardo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                X / Twitter
                <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
              </a>

              {/* Sign out (authenticated only) */}
              {status === "authenticated" && (
                <>
                  <div className="my-4 border-t border-white/[0.06]" />
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/[0.08] transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Image
                src="/pickslogoicon.png"
                alt="RealityPicks"
                width={32}
                height={32}
                className="rounded-lg group-hover:shadow-glow transition-shadow duration-300"
                style={{ mixBlendMode: "screen" }}
              />
            </motion.div>
            <span className="text-lg font-display font-bold tracking-tight">
              Reality<span className="text-neon-cyan">Picks</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {status === "authenticated" &&
              navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-lg bg-neon-cyan/[0.08] border border-neon-cyan/10 -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}

            {/* Learn dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    learnItems.some((i) => pathname === i.href)
                      ? "text-foreground bg-neon-cyan/[0.08] border border-neon-cyan/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Learn
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {learnItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {status === "loading" && (
              <div className="h-8 w-20 rounded-md bg-secondary shimmer" />
            )}

            {status === "unauthenticated" && (
              <Button
                onClick={() => router.push("/auth/signin")}
                size="sm"
                className="hidden md:inline-flex shadow-glow"
              >
                Sign In
              </Button>
            )}

            {status === "authenticated" && session?.user && (
              <>
                {/* Admin link */}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="hidden md:block">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* User menu (desktop) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold ring-1 ring-neon-cyan/30">
                        {session.user.name?.[0]?.toUpperCase() ||
                          session.user.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate">
                        {session.user.name || session.user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile hamburger button — always visible on mobile */}
            {status !== "loading" && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Portal the mobile menu to document.body so backdrop-filter on header doesn't trap fixed positioning */}
      {typeof document !== "undefined" && createPortal(mobileMenu, document.body)}
    </>
  );
}
