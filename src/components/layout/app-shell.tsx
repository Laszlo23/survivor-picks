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
 * Inside Farcaster: the host provides its own header, so we hide our chrome.
 * Standalone web: render all navigation elements as normal.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { isInMiniApp } = useFarcaster();

  return (
    <>
      {!isInMiniApp && <Navbar />}
      <main
        className={`min-h-[calc(100vh-56px)] overflow-x-hidden ${
          isInMiniApp ? "pb-0" : "pb-20 md:pb-0"
        }`}
      >
        {children}
      </main>
      {!isInMiniApp && <AppFooter />}
      {!isInMiniApp && <BottomTabs />}
    </>
  );
}
