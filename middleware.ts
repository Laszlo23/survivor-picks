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

const CSRF_POST_ROUTES = ["/api/referral/capture"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── CSRF: Origin validation on custom POST endpoints ───────────
  if (
    request.method === "POST" &&
    CSRF_POST_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "Invalid origin" },
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
  ],
};
