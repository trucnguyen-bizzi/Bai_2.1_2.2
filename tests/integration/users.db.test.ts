import { Prisma } from "@prisma/client";
import prisma from "../../src/lib/prisma";
import seedAdmin from "../../src/lib/seedAdmin";

// Mọi dữ liệu test dùng tiền tố "it-" để dọn sạch mà không đụng tới admin thật.
const testEmailPrefix = "it-";

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
}

describe("users table (needs a migrated PostgreSQL)", () => {
  beforeEach(cleanUp);

  afterAll(async () => {
    await cleanUp();
    await prisma.$disconnect();
  });

  it("gives new users the default role 'user'", async () => {
    const user = await prisma.user.create({
      data: { email: "it-default@example.com", username: "it_default", passwordHash: "x" },
    });

    expect(user.role).toBe("user");
  });

  it("rejects a duplicate email", async () => {
    const data = { email: "it-dup@example.com", username: "it_dup_one", passwordHash: "x" };
    await prisma.user.create({ data });

    await expect(
      prisma.user.create({ data: { ...data, username: "it_dup_two" } }),
    ).rejects.toThrow();
  });

  it("rejects a duplicate username", async () => {
    await prisma.user.create({
      data: { email: "it-a@example.com", username: "it_same_name", passwordHash: "x" },
    });

    await expect(
      prisma.user.create({
        data: { email: "it-b@example.com", username: "it_same_name", passwordHash: "x" },
      }),
    ).rejects.toThrow();
  });

  it("rejects a role that is not admin or user", async () => {
    await expect(
      prisma.$executeRaw(Prisma.sql`
        INSERT INTO users (id, email, username, password_hash, role, updated_at)
        VALUES (gen_random_uuid(), 'it-role@example.com', 'it_role', 'x', 'superadmin', now())`),
    ).rejects.toThrow();
  });
});

describe("seedAdmin (needs a migrated PostgreSQL)", () => {
  const config = {
    email: "it-admin@example.com",
    username: "it_admin",
    password: "Admin@123456",
  };

  beforeEach(cleanUp);

  afterAll(async () => {
    await cleanUp();
  });

  it("creates an admin whose password is stored as a bcrypt hash", async () => {
    const admin = await seedAdmin(prisma, config);

    expect(admin.role).toBe("admin");
    expect(admin.passwordHash).not.toBe(config.password);
    expect(admin.passwordHash.startsWith("$2")).toBe(true);
  });

  it("is idempotent: running twice keeps one admin and does not overwrite it", async () => {
    const first = await seedAdmin(prisma, config);
    const second = await seedAdmin(prisma, { ...config, password: "Another@Pass1" });

    const total = await prisma.user.count({ where: { email: config.email } });

    expect(total).toBe(1);
    expect(second.id).toBe(first.id);
    expect(second.passwordHash).toBe(first.passwordHash);
  });
});
