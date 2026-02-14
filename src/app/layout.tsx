import type { Metadata } from "next";
import { Inter, Space_Grotesk, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";

export const metadata: Metadata = {
  title: "RealityPicks — Predict Reality TV. Win Glory.",
  description:
    "Predict outcomes across Survivor, The Traitors, The Bachelor, and more. Earn points, build streaks, climb the leaderboard. Free to play.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "RealityPicks — Predict Reality TV. Win Glory.",
    description:
      "Predict outcomes across Survivor, The Traitors, The Bachelor, and more. Free to play prediction game.",
    url: BASE_URL,
    siteName: "RealityPicks",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RealityPicks — Predict Reality TV",
    description: "Free prediction game for reality TV fans.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Farcaster Mini App embed — makes every page shareable in Farcaster feeds
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${BASE_URL}/og-image.png`,
      button: {
        title: "Predict Now",
        action: {
          type: "launch_frame",
          name: "RealityPicks",
          url: BASE_URL,
          splashImageUrl: `${BASE_URL}/logo.png`,
          splashBackgroundColor: "#0a0a0f",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${oswald.variable} font-sans antialiased min-h-screen overflow-x-hidden`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
