# Architecture Context

## Stack

| Layer          | Technology                      | Role                                          |
| -------------- | ------------------------------- | --------------------------------------------- |
| Runtime        | Node.js (>= 20)                 | Chạy ứng dụng                                 |
| Language       | TypeScript (strict)             | Ngôn ngữ chính                                |
| Database       | PostgreSQL 16                   | Lưu dữ liệu quan hệ                           |
| ORM            | Prisma 6                        | Schema, migration, seed, type-safe client     |
| Infra (local)  | Docker Compose                  | Chạy Postgres, không cần cài vào máy          |
| Password hash  | bcrypt                          | Hash mật khẩu (seed và bài 2.2)               |
| Script runner  | tsx                             | Chạy TypeScript trực tiếp (seed, scripts)     |
| Env loading    | dotenv                          | Nạp `.env` cho script/ứng dụng                |
| Lint / format  | ESLint 9 + Prettier             | Ép coding standard của team                   |
| Test           | Jest 29 + ts-jest               | Unit test và integration test                 |
| HTTP (bài 2.2) | Fastify + @fastify/jwt + Joi    | Auth API, JWT, validate input                 |

## System Boundaries

- `prisma/` — sở hữu schema (`schema.prisma`), migrations và `seed.ts`.
  Là nguồn sự thật duy nhất của cấu trúc database.
- `src/` — code ứng dụng: `config/` (đọc và validate env), `lib/` (prisma, hashPassword, verifyPassword, seedAdmin); bài 2.2 thêm routes, services, schemas (Joi), plugins.
- `tests/` — `unit/` (không cần DB) và `integration/` (cần Postgres đã migrate).
- `docker-compose.yml` — hạ tầng local (Postgres, có healthcheck).
- `scripts/` — script hỗ trợ, gồm `verify-db.ts` (kiểm tra tự động bài 2.1).
- `.env` — cấu hình và secret local. Không commit. `.env.example` là bản mẫu.
- `context/` — tài liệu context cho AI và developer.

## Storage Model

- **PostgreSQL**: lưu toàn bộ dữ liệu người dùng (`users`). Chạy trong
  container, dữ liệu lưu ở Docker volume `pgdata` nên không mất khi
  `docker compose down` (chỉ mất khi dùng `-v`).
- **Không có blob/file storage** ở giai đoạn này.

## Data Model (bài 2.1)

Bảng `users` (model `User`, `@@map("users")`):

| Cột (DB)        | Field (code)  | Kiểu                    | Ghi chú                          |
| --------------- | ------------- | ----------------------- | -------------------------------- |
| `id`            | `id`          | UUID, PK                | `@default(uuid())`, `@db.Uuid`   |
| `email`         | `email`       | String, UNIQUE          |                                  |
| `username`      | `username`    | String, UNIQUE          |                                  |
| `password_hash` | `passwordHash`| String                  | bcrypt hash                      |
| `role`          | `role`        | enum `Role`             | `admin` / `user`, mặc định `user`|
| `created_at`    | `createdAt`   | DateTime                | `@default(now())`                |
| `updated_at`    | `updatedAt`   | DateTime                | `@updatedAt`                     |

Enum `Role`: `admin`, `user`.

## Auth and Access Model

- Xác thực bằng JWT (bài 2.2). Token chứa `sub` (user id) và `role`.
- Phân quyền theo `Role`: `admin` có toàn quyền, `user` bị giới hạn.
- Tài khoản admin đầu tiên được tạo bằng seed, không qua API đăng ký.
- API đăng ký công khai luôn tạo user với role `user`, không cho client
  tự chọn role.

## Invariants

1. Role chỉ nhận `admin` hoặc `user` (ràng buộc bằng enum ở tầng DB).
2. Không bao giờ lưu mật khẩu plain text; chỉ lưu bcrypt hash.
3. Mọi thay đổi cấu trúc database đều đi qua Prisma migration.
4. Không sửa tay file migration đã chạy; muốn đổi thì tạo migration mới.
5. Secret (DATABASE_URL, JWT_SECRET, mật khẩu admin) chỉ nằm trong `.env`,
   không commit và không hard-code.
6. Seed phải idempotent (dùng `upsert`), chạy lại không lỗi và không trùng.
7. Không đưa dữ liệu nhạy cảm (mật khẩu, hash) vào payload JWT hoặc response.
8. Logic nghiệp vụ nằm trong các hàm nhỏ có thể test độc lập; script (`seed.ts`) chỉ nối các hàm đó lại.
9. Test không được làm hỏng dữ liệu thật: dữ liệu test dùng tiền tố `it-` và được dọn sau mỗi lần chạy.
