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
  title: "Survivor Picks — Prediction Game",
  description:
    "Predict challenge winners, eliminations, and twists. Earn points, climb the leaderboard, and prove you know the game better than anyone.",
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
