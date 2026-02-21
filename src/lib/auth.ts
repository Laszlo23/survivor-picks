import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { creditSignupBonus } from "@/lib/actions/token-balance";

const SIGNUP_BONUS = BigInt(33_333);

function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Get Supabase auth user and our app User. Creates User if first sign-in. */
export async function getCurrentUser() {
  try {
    // Direct auth cookie: used by dev-login and Farcaster (bypasses Supabase)
    const cookieStore = await cookies();
    const directUserId = cookieStore.get("rp-auth-user-id")?.value;
    if (directUserId) {
      const user = await prisma.user.findUnique({
        where: { id: directUserId },
      });
      if (user) return user;
    }

    let authUser = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      authUser = data.user;
    } catch {
      // Supabase not configured or client error
    }

    if (!authUser?.email) return null;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseAuthId: authUser.id },
          { email: authUser.email },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: authUser.email,
          name: authUser.user_metadata?.name ?? authUser.email.split("@")[0],
          image: authUser.user_metadata?.avatar_url,
          supabaseAuthId: authUser.id,
          emailVerified: new Date(),
          referralCode: genReferralCode(),
          hasOnboarded: true,
          picksBalance: SIGNUP_BONUS,
        },
      });
      try {
        await creditSignupBonus(user.id);
      } catch {
        // Bonus will be retried on next login
      }
    } else if (!user.supabaseAuthId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { supabaseAuthId: authUser.id },
      });
    }

    return user;
  } catch (err) {
    console.error("[auth] getCurrentUser failed:", err);
    return null;
  }
}

/** Session shape compatible with existing code expecting NextAuth session */
export async function getSession() {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
    expires: "",
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
