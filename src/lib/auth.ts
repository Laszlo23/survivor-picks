import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { creditSignupBonus } from "@/lib/actions/token-balance";

const SIGNUP_BONUS = BigInt(33_333);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT || 465),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
        secure: true,
      },
      from: process.env.EMAIL_FROM || "winning@realitypicks.net",
    }),

    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
      },
      async authorize(credentials) {
        const addr = credentials?.walletAddress?.toLowerCase();
        if (!addr) return null;

        let user = await prisma.user.findFirst({
          where: { walletAddress: addr },
        });

        if (!user) {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let referralCode = "";
          for (let i = 0; i < 8; i++) {
            referralCode += chars[Math.floor(Math.random() * chars.length)];
          }

          const shortAddr = `${addr.slice(0, 6)}...${addr.slice(-4)}`;

          try {
            user = await prisma.user.create({
              data: {
                email: `wallet-${addr}@wallet.local`,
                name: shortAddr,
                walletAddress: addr,
                referralCode,
                emailVerified: new Date(),
                hasOnboarded: true,
                picksBalance: SIGNUP_BONUS,
              },
            });

            await creditSignupBonus(user.id);
          } catch {
            user = await prisma.user.findFirst({
              where: { walletAddress: addr },
            });
          }
        }

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = (user as any).role || "USER";
        token.name = user.name;
      }

      if (trigger === "signIn" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
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
      if (!user.id) return;

      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++) {
        referralCode += chars[Math.floor(Math.random() * chars.length)];
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          referralCode,
          hasOnboarded: true,
          picksBalance: SIGNUP_BONUS,
        },
      });

      await creditSignupBonus(user.id);
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
