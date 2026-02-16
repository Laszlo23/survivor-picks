import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route protection middleware for RealityPicks.
 *
 * - Protected routes require authentication → redirect to /auth/signin
 * - Admin routes additionally require ADMIN role → 403
 * - API routes under /api/admin require ADMIN role → 401
 * - Custom POST endpoints validate Origin header for CSRF
 */

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/leaderboard",
  "/staking",
  "/token",
];

const ADMIN_ROUTES = ["/admin"];

// CSRF: Validate Origin header on all POST mutation routes.
// Agent endpoints (/api/agent/*) use their own x-agent-key header auth so they are excluded.
// Auth routes (/api/auth/*) are handled by NextAuth's built-in CSRF.
// Farcaster routes are excluded: webhook uses JFS signatures, auth bridge is called from iframe.
const CSRF_POST_ROUTES = [
  "/api/referral/capture",
  "/api/nft",
  "/api/admin",
];

// Routes that bypass CSRF origin checks (called from cross-origin contexts)
const CSRF_EXEMPT_ROUTES = [
  "/api/farcaster/webhook",
  "/api/auth/farcaster",
];

// Rate limiting is handled per-route in src/lib/rate-limit.ts (in-memory).
// For multi-instance scaling, replace with @upstash/ratelimit + Redis.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── CSRF: Origin validation on custom POST endpoints ───────────
  const isCsrfExempt = CSRF_EXEMPT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (
    request.method === "POST" &&
    !isCsrfExempt &&
    CSRF_POST_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Reject POSTs without an Origin header (prevents curl/Postman CSRF bypass)
    if (!origin) {
      return NextResponse.json(
        { error: "Missing origin header" },
        { status: 403 }
      );
    }

    if (host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "Invalid origin" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Malformed origin header" },
          { status: 403 }
        );
      }
    }
  }

  // ─── Get the session token ──────────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ─── Protected page routes ─────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminPage = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isProtected || isAdminPage) && !token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ─── Admin role check for pages ─────────────────────────────────
  if (isAdminPage && token && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ─── Admin role check for API routes ────────────────────────────
  if (isAdminApi && (!token || token.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Unauthorized: admin access required" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

// Only run middleware on matched routes (skip static files, images, etc.)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/leaderboard/:path*",
    "/staking/:path*",
    "/token/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/referral/:path*",
    "/api/nft/:path*",
    "/api/farcaster/:path*",
    "/api/auth/farcaster/:path*",
  ],
};
