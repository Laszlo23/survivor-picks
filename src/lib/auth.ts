import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import { claimReferral } from "@/lib/actions/referral";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    // Wallet authentication is handled by /api/auth/wallet which creates
    // JWT sessions directly. This dummy CredentialsProvider satisfies
    // NextAuth's requirement for at least one provider while keeping
    // the JWT strategy and adapter functional.
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {},
      async authorize() {
        // Actual wallet auth is done in /api/auth/wallet route.
        // This provider exists only so NextAuth initializes properly.
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, isNewUser }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
        }

        // Process referral for new users on first sign-in
        if (isNewUser && dbUser) {
          try {
            const cookieStore = cookies();
            const refCode = cookieStore.get("ref_code")?.value;
            if (refCode && refCode.length === 8) {
              await claimReferral(refCode, dbUser.id);
            }
          } catch (err) {
            // Don't block sign-in if referral claim fails
            console.error("Referral claim on signup failed:", err);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-assign admin role based on env variable
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && user.email === adminEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }

      // Generate a referral code for every new user
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: code },
        });
      } catch {
        // Collision — rare, will be generated on first profile visit
      }
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
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
