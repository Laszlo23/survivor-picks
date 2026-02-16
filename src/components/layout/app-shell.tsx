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

  // Only hide navigation when we're certain we're inside a Mini App
  const hideChrome = isReady && isInMiniApp;

  return (
    <>
      {!hideChrome && <Navbar />}
      <main
        className={`min-h-[calc(100vh-56px)] overflow-x-hidden ${
          hideChrome ? "pb-0" : "pb-20 md:pb-0"
        }`}
      >
        {children}
      </main>
      {!hideChrome && <AppFooter />}
      {!hideChrome && <BottomTabs />}
    </>
  );
}
