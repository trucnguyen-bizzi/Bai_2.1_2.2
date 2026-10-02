import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import getAdminSeedConfig from "../src/config/getAdminSeedConfig";
import verifyPassword from "../src/lib/verifyPassword";

/**
 * Kiểm tra tự động các yêu cầu của Bài tập 2.1.
 * Chạy: npm run db:verify  (exit code 0 = đạt tất cả)
 */
const prisma = new PrismaClient();
let failed = 0;

function report(name: string, ok: boolean, detail = ""): void {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

async function main(): Promise<void> {
  const { email: adminEmail, password: adminPassword } = getAdminSeedConfig();

  // 1. Kết nối Postgres
  await prisma.$queryRaw`SELECT 1`;
  report("Kết nối được PostgreSQL", true);

  // 2. Bảng users tồn tại
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'`;
  report('Bảng "users" tồn tại', tables.length === 1);

  // 3. Enum Role chỉ có admin, user
  const enumRows = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT unnest(enum_range(NULL::"Role"))::text AS value`;
  const values = enumRows.map((row) => row.value).sort();
  report(
    "Enum Role chỉ gồm admin, user",
    values.length === 2 && values[0] === "admin" && values[1] === "user",
    values.join(", "),
  );

  // 4. Admin đã được seed, đúng 1 dòng
  const admins = await prisma.user.findMany({ where: { email: adminEmail } });
  report("Có đúng 1 admin được seed", admins.length === 1, adminEmail);
  const [admin] = admins;

  if (admin) {
    report("Admin có role = admin", admin.role === "admin");
    report(
      "Mật khẩu admin là bcrypt hash (không plain text)",
      admin.passwordHash.startsWith("$2") && admin.passwordHash !== adminPassword,
    );
    report(
      "Hash khớp với ADMIN_PASSWORD trong .env",
      await verifyPassword(adminPassword, admin.passwordHash),
    );
  }

  // 5. DB từ chối role không hợp lệ
  let rejected = false;
  try {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO users (id, email, username, password_hash, role, updated_at)
      VALUES (gen_random_uuid(), 'invalid-role@example.com', 'invalid_role_test',
              'x', 'superadmin', now())`);
  } catch {
    rejected = true;
  }
  report("DB từ chối role không hợp lệ (superadmin)", rejected);

  // 6. Role mặc định là "user"
  const probeEmail = "default-role-probe@example.com";
  try {
    const probe = await prisma.user.create({
      data: { email: probeEmail, username: "default_role_probe", passwordHash: "x" },
    });
    report('Role mặc định là "user"', probe.role === "user", probe.role);
  } finally {
    await prisma.user.deleteMany({ where: { email: probeEmail } });
  }

  // 7. Email phải unique
  let duplicateRejected = false;
  try {
    await prisma.user.create({
      data: { email: adminEmail, username: "duplicate_probe", passwordHash: "x" },
    });
  } catch {
    duplicateRejected = true;
  } finally {
    await prisma.user.deleteMany({ where: { username: "duplicate_probe" } });
  }
  report("DB từ chối email trùng (UNIQUE)", duplicateRejected);
}

main()
  .catch((error: unknown) => {
    console.error("Không chạy được verify:", error);
    failed += 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(failed === 0 ? "\nTẤT CẢ ĐẠT" : `\n${failed} kiểm tra KHÔNG ĐẠT`);
    process.exit(failed === 0 ? 0 : 1);
  });
