import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // NO adapter — CredentialsProvider manages users directly via Prisma.
  // Having PrismaAdapter here silently breaks session cookie creation.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
      },
      async authorize(credentials) {
        const addr = credentials?.walletAddress?.toLowerCase();
        if (!addr) return null;

        // Find existing user
        let user = await prisma.user.findFirst({
          where: { walletAddress: addr },
        });

        // Create new user if first time
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
              },
            });
          } catch {
            // Race condition — retry find
            user = await prisma.user.findFirst({
              where: { walletAddress: addr },
            });
          }
        }

        if (!user) return null;

        // Return user object with role — NextAuth creates the JWT from this
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = (user as any).role || "USER";
        token.name = user.name;
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
