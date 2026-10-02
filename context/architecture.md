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
| HTTP (bài 2.2) | Fastify 5 + fastify-plugin      | Server HTTP, chia route thành plugin          |
| JWT (bài 2.2)  | @fastify/jwt 10                 | Ký và xác thực access token (HS256)           |
| Validate       | Joi 18                          | Validate payload, là validator của Fastify    |

## System Boundaries

- `prisma/` — sở hữu schema (`schema.prisma`), migrations và `seed.ts`.
  Là nguồn sự thật duy nhất của cấu trúc database.
- `src/` — code ứng dụng:
  - `index.ts` điểm vào server; `buildApp.ts` dựng FastifyInstance (dùng chung cho server và test)
  - `config/` đọc và validate env; `lib/` hàm dùng chung (prisma, hashPassword, verifyPassword, seedAdmin, sendPasswordResetEmail)
  - `plugins/` (prisma, errorHandler, joiValidator, jwt); `hooks/` (requireRole); `types/` (khai báo kiểu Fastify)
  - `modules/auth/` (routes, service, schemas Joi, resetToken); `modules/users/` (routes, toPublicUser)
  - Quy tắc: route chỉ nhận request và gọi service; logic nghiệp vụ nằm trong service; service nhận `prisma` qua tham số.
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

## Data Model

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

Bài 2.2 (Unit 10) thêm hai cột cho luồng quên mật khẩu:

| Cột (DB)                 | Field (code)          | Kiểu                | Ghi chú                              |
| ------------------------ | --------------------- | ------------------- | ------------------------------------ |
| `reset_token_hash`       | `resetTokenHash`      | String?, UNIQUE     | SHA-256 của token đặt lại, không lưu token gốc |
| `reset_token_expires_at` | `resetTokenExpiresAt` | DateTime?           | Hạn dùng (mặc định 15 phút)          |

## Auth and Access Model

- Đăng nhập bằng `username` + `password` (`POST /auth/login`), trả access token JWT.
- JWT: thuật toán `HS256` (khai báo tường minh khi ký và verify), hạn mặc định 15 phút, **chưa có refresh token**.
  Payload chỉ gồm `sub` (user id), `role`, `iat`, `exp`; không chứa email, hash hay dữ liệu nhạy cảm.
- `JWT_SECRET` đọc từ env, tối thiểu 32 ký tự; thiếu hoặc quá ngắn thì server từ chối khởi động.
- Route cần đăng nhập dùng `app.authenticate`; route giới hạn role dùng thêm `requireRole(...)`.
  401 = chưa xác thực (cùng một message cho mọi nguyên nhân), 403 = đã xác thực nhưng thiếu quyền.
- Role nằm trong token nên đổi role của user chỉ có hiệu lực khi token cũ hết hạn (giới hạn đã biết).
- Phân quyền theo `Role`: `admin` được xem toàn bộ user (`GET /users`), `user` chỉ xem chính mình (`GET /me`).
- Tài khoản admin đầu tiên được tạo bằng seed, không qua API đăng ký.
- API đăng ký công khai luôn tạo user với role `user`; payload có field `role` bị từ chối (400).

### Endpoints (bài 2.2)

| Method | Đường dẫn | Xác thực | Mô tả | Unit |
|---|---|---|---|---|
| GET | `/health` | Không | Kiểm tra server sống | 06 |
| POST | `/auth/register` | Không | Đăng ký (role luôn `user`) | 07 |
| POST | `/auth/login` | Không | Đăng nhập, nhận JWT | 08 |
| GET | `/me` | Bearer JWT | Thông tin chính mình | 09 |
| GET | `/users` | Bearer JWT, role `admin` | Danh sách user | 09 |
| POST | `/auth/forgot-password` | Không | Yêu cầu token đặt lại (luôn 202) | 10 |
| POST | `/auth/reset-password` | Không (cần reset token) | Đặt mật khẩu mới | 10 |

Định dạng lỗi chung: `{ "statusCode", "error", "message", "details"? }`; lỗi 5xx không lộ stack trace.

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
10. Mọi response lỗi đăng nhập trả cùng một message (không lộ username có tồn tại); `forgot-password` luôn trả cùng một response.
11. Reset token chỉ được lưu dưới dạng hash, dùng một lần, có hạn; token gốc không bao giờ nằm trong response HTTP.
12. `JWT_SECRET` chỉ nằm trong `.env`, tối thiểu 32 ký tự; server không khởi động nếu thiếu.
13. Client không bao giờ được chọn role khi đăng ký; response không bao giờ chứa `passwordHash` hay trường reset token (dùng `toPublicUser`).
14. Không log mật khẩu, hash, JWT. Ngoại lệ duy nhất: reset token được ghi log ở môi trường không phải production, thay cho việc gửi email.
