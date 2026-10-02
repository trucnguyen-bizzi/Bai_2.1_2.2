import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import getAdminSeedConfig from "../src/config/getAdminSeedConfig";
import seedAdmin from "../src/lib/seedAdmin";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await seedAdmin(prisma, getAdminSeedConfig());

  console.log(`Seeded admin: ${admin.email} (${admin.role})`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
