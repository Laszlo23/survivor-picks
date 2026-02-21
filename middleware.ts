import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/leaderboard",
  "/staking",
  "/token",
];

const ADMIN_ROUTES = ["/admin"];

const CSRF_POST_ROUTES = [
  "/api/referral/capture",
  "/api/nft",
  "/api/admin",
];

const CSRF_EXEMPT_ROUTES = [
  "/api/farcaster/webhook",
  "/api/auth/farcaster",
  "/api/auth/wallet",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the auth callback page handle tokens without middleware interference
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Also allow rp-auth-user-id (Farcaster, dev-login)
  const hasDirectAuth = request.cookies.get("rp-auth-user-id")?.value;
  const isAuthenticated = !!authUser || !!hasDirectAuth;

  // ─── CSRF ───────────────────────────────────────────────────────
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

  // ─── Protected routes ───────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminPage = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((isProtected || isAdminPage) && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ─── Admin role check (role stored in app DB, checked in page/API) ─
  // Middleware only checks auth; admin redirect happens in layout/route

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
