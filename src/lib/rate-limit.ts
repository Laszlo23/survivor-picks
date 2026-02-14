/**
 * Simple in-memory rate limiter for API routes.
 *
 * Works well for single-instance deployments (Hostinger, Vercel serverless).
 * For multi-instance scaling, replace with @upstash/ratelimit + Redis.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   const { success, remaining } = limiter.check(identifier);
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimiterOptions = {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  max: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Clean expired entries every 60 seconds to prevent memory leaks
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      for (const [, store] of stores) {
        for (const [key, entry] of store) {
          if (now > entry.resetAt) {
            store.delete(key);
          }
        }
      }
    }, 60_000);
  }
}

export function createRateLimiter(options: RateLimiterOptions) {
  const storeKey = `${options.windowMs}:${options.max}`;
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }
  const store = stores.get(storeKey)!;
  scheduleCleanup();

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      // No existing entry or expired — create new window
      if (!entry || now > entry.resetAt) {
        const resetAt = now + options.windowMs;
        store.set(identifier, { count: 1, resetAt });
        return { success: true, remaining: options.max - 1, resetAt };
      }

      // Within window — increment
      entry.count++;
      if (entry.count > options.max) {
        return { success: false, remaining: 0, resetAt: entry.resetAt };
      }

      return {
        success: true,
        remaining: options.max - entry.count,
        resetAt: entry.resetAt,
      };
    },
  };
}

// ─── Pre-configured limiters for common use cases ────────────────────

/** General API: 30 requests per minute */
export const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

/** Auth endpoints: 10 requests per minute */
export const authLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** Expensive operations (NFT eligibility, AI agent): 5 requests per minute */
export const heavyLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

/** Webhook endpoints: 60 requests per minute */
export const webhookLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

// ─── Helper to get client IP ─────────────────────────────────────────

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// ─── Helper to create a 429 response ─────────────────────────────────

export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(retryAfter, 1)),
      },
    }
  );
}
