"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useFarcaster } from "@/lib/farcaster/provider";
import { Navbar } from "@/components/layout/navbar";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { AppFooter } from "@/components/layout/app-footer";

/**
 * AppShell conditionally renders the Navbar, Footer, and BottomTabs
 * based on whether the app is running inside a Farcaster Mini App,
 * or on fullscreen pages like /live-demo.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { isInMiniApp, isReady } = useFarcaster();
  const pathname = usePathname();

  // Hide chrome on fullscreen live demo
  const isFullscreenPage = pathname === "/live-demo";

  // Only hide top navbar + desktop footer inside a Mini App
  const hideChrome = isReady && isInMiniApp;

  const showNavbar = !isFullscreenPage;
  const showFooter = !hideChrome && !isFullscreenPage;
  const showBottomTabs = !isFullscreenPage;

  return (
    <>
      {showNavbar && <Navbar />}
      <main
        className={`overflow-x-hidden pb-20 md:pb-0 ${
          isFullscreenPage ? "min-h-screen" : "min-h-[calc(100vh-56px)]"
        }`}
      >
        {children}
      </main>
      {showFooter && <AppFooter />}
      {showBottomTabs && <BottomTabs />}
    </>
  );
}
