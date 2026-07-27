import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password.util";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const hashedPassword = await hashPassword(env.adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: env.adminEmail },
    update: {},
    create: {
      email: env.adminEmail,
      password: hashedPassword,
      role: Role.ADMIN
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
