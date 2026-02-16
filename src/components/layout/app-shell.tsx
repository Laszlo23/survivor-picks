"use client";

import { type ReactNode } from "react";
import { useFarcaster } from "@/lib/farcaster/provider";
import { Navbar } from "@/components/layout/navbar";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { AppFooter } from "@/components/layout/app-footer";

/**
 * AppShell conditionally renders the Navbar, Footer, and BottomTabs
 * based on whether the app is running inside a Farcaster Mini App.
 *
 * Optimistic rendering: show navigation by default.
 * Only suppress once the Farcaster SDK has finished initialising AND
 * confirmed that we are genuinely inside a Mini App (isReady + isInMiniApp).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { isInMiniApp, isReady } = useFarcaster();

  // Only hide top navbar + desktop footer inside a Mini App
  // (Farcaster provides its own header). Bottom tabs stay visible.
  const hideChrome = isReady && isInMiniApp;

  return (
    <>
      {/* Always show Navbar (hamburger menu) — even inside Farcaster Mini App */}
      <Navbar />
      <main
        className={`min-h-[calc(100vh-56px)] overflow-x-hidden pb-20 md:pb-0`}
      >
        {children}
      </main>
      {!hideChrome && <AppFooter />}
      <BottomTabs />
    </>
  );
}
