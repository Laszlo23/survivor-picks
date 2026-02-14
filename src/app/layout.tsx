import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RealityPicks — Predict Reality TV. Win Glory.",
  description:
    "Predict outcomes across Survivor, The Traitors, The Bachelor, and more. Earn points, build streaks, climb the leaderboard. Free to play.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz"
  ),
  openGraph: {
    title: "RealityPicks — Predict Reality TV. Win Glory.",
    description:
      "Predict outcomes across Survivor, The Traitors, The Bachelor, and more. Free to play prediction game.",
    url: "https://realitypicks.xyz",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen overflow-x-hidden`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
