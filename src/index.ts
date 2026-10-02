import prisma from "./lib/prisma";

async function main(): Promise<void> {
  const total = await prisma.user.count();
  console.log(`Database connected. Total users: ${total}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
