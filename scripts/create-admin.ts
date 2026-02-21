/**
 * One-off: Create or update user as ADMIN.
 * Usage: npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "laszlo.bihary@gmail.com";
  const ref = "ADM" + Date.now().toString(36).slice(-5).toUpperCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      email,
      name: "Laszlo",
      role: "ADMIN",
      emailVerified: new Date(),
      referralCode: ref,
      picksBalance: BigInt(33_333),
    },
  });

  console.log(`✅ Admin user: ${user.email} (role: ${user.role})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
