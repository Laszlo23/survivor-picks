"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Invisible component that captures ?ref=CODE from the URL
 * and stores it as a cookie via the API route.
 * Place this in the root layout or landing page.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.length === 8) {
      // Store referral code in cookie
      fetch("/api/referral/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref }),
      }).catch(() => {
        // Silent fail
      });
    }
  }, [searchParams]);

  return null;
}
