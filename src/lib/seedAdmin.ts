import { PrismaClient, Role, User } from "@prisma/client";
import type { AdminSeedConfig } from "../config/getAdminSeedConfig";
import hashPassword from "./hashPassword";

// upsert + update: {} => chạy nhiều lần không lỗi, không tạo trùng, không ghi đè admin đã có.
export default async function seedAdmin(
  prisma: PrismaClient,
  config: AdminSeedConfig,
): Promise<User> {
  const passwordHash = await hashPassword(config.password);

  return prisma.user.upsert({
    where: { email: config.email },
    update: {},
    create: {
      email: config.email,
      username: config.username,
      passwordHash,
      role: Role.admin,
    },
  });
}
