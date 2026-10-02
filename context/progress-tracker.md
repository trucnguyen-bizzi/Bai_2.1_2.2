# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Bài tập 2.1 (Database) đã hoàn tất về chức năng và được kiểm chứng trên PostgreSQL thật.
- Bài tập 2.2, Unit 06 (Fastify skeleton) hoàn tất theo xác nhận của user.

## Current Goal

- Unit 07 — đăng ký và validate bằng Joi đã hoàn tất và được xác minh.

## Completed (Unit 01–05; đã kiểm chứng trên PostgreSQL thật)

- Project Node.js + TypeScript (`package.json`, `tsconfig.json`, strict)
- `docker-compose.yml` cho Postgres 16 có healthcheck
- `prisma/schema.prisma`: model `User`, enum `Role`
- Migration `20261001000000_init_users` (+ `migration_lock.toml`)
- `prisma/seed.ts`: seed admin bằng `upsert`, hash bcrypt
- `scripts/verify-db.ts`: kiểm tra tự động yêu cầu 2.1
- ESLint + Prettier cấu hình theo Coding standard của team (`eslint.config.mjs`, `.prettierrc.json`, `.editorconfig`); `context/code-standards.md` viết theo tài liệu thật
- Đã chạy `eslint` và `prettier --check` sạch lỗi trên toàn bộ code
- Tách logic khỏi seed thành hàm nhỏ: `hashPassword`, `verifyPassword`, `getAdminSeedConfig`, `seedAdmin`
- Unit test (Jest): 10 test cho `hashPassword`, `verifyPassword`, `getAdminSeedConfig`; đã chạy PASS
- Integration test (Jest) cho bảng users và `seedAdmin` (role mặc định, unique, role sai, seed idempotent); 6 test đã PASS trên PostgreSQL thật
- `.env`, `.env.example`, `.gitignore`
- `AGENTS.md` (Codex) và `CLAUDE.md` (Claude Code)

## Units (xem `context/specs/00-build-plan.md`)

| Unit | Tên | Trạng thái |
|---|---|---|
| 01 | Project scaffold | Hoàn tất, đã kiểm chứng |
| 02 | Postgres bằng Docker Compose | Hoàn tất, đã kiểm chứng trên PostgreSQL thật |
| 03 | Prisma schema và migration | Hoàn tất, đã kiểm chứng trên PostgreSQL thật |
| 04 | Seed admin | Hoàn tất, đã kiểm chứng trên PostgreSQL thật |
| 05 | Kiểm chứng tự động | Hoàn tất; unit và integration test đã PASS |
| 06 | Fastify skeleton | Hoàn tất, đã xác minh (xác nhận của user) |
| 07 | Đăng ký + validate bằng Joi | Hoàn tất, đã xác minh |
| 08–11 | Auth Server (bài 2.2) | Chưa thực hiện |

## In Progress

- None yet.

## Checklist nghiệm thu Bài 2.1 (tick sau khi chạy thật)

- [x] `npm install` thành công
- [x] `npm run typecheck` không lỗi
- [x] `npm run lint` không lỗi
- [x] `npm test` (unit) đạt — 10 test PASS
- [x] `npm run test:integration` đạt — 6 test PASS (1 suite)
- [x] `npm run db:up` — Postgres healthy; `0.0.0.0:5433->5432/tcp`
- [x] `npm run db:deploy` — migration `20261001000000_init_users` áp dụng thành công
- [ ] Đã đọc và hiểu `migration.sql` — user must confirm
- [x] `npm run db:seed` — chạy hai lần thành công, cùng một admin
- [x] `npm run db:verify` — 10 PASS, kết thúc `TẤT CẢ ĐẠT`
- [ ] Xem được dữ liệu bằng `npm run db:studio` — user must confirm
- [ ] `.env` không bị commit — user must confirm

## Next Up

- Chờ user giao Unit 08; không bắt đầu trước khi được yêu cầu.

## Open Questions

- Team dùng Prisma phiên bản nào? (Gói này dùng Prisma 6; Prisma 7 cấu hình khác
  với `prisma.config.ts` và driver adapter.)
- Team có yêu cầu bcrypt hay argon2 cho hash mật khẩu?
- Quy định của team về việc dùng AI coding tool trong training?
- Coding standard ghi nháy kép (6.1) nhưng ví dụ dùng nháy đơn: chốt với mentor (xem cuối `code-standards.md`).
- Team có chuẩn riêng cho TypeScript không? Hiện phần TS là bổ sung của gói này.
- Có nên chuẩn hóa email thành chữ thường không?
- Nên để `id` / `updated_at` được tạo bởi database thay vì Prisma không?

## Architecture Decisions

- Dùng UUID làm khoá chính: thống nhất với bảng `invoices` /
  `invoice_items` ở Tuần 1 Ngày 4 (file kế hoạch dùng uuid).
- Role dùng enum ở tầng DB thay vì string tự do: DB tự từ chối giá trị
  ngoài `admin` / `user`.
- Seed dùng `upsert` với `update: {}`: chạy lại không lỗi và không ghi
  đè mật khẩu admin nếu đã đổi.
- Đặt tên DB snake_case bằng `@map`: khớp convention SQL, code vẫn camelCase.
- Migration viết sẵn và commit: người khác chỉ cần `migrate deploy`, kết quả
  giống nhau trên mọi máy.
- Giữ cấu hình seed trong `package.json#prisma` (Prisma 6). Khi nâng Prisma 7
  phải chuyển sang `prisma.config.ts`.
- Docker healthcheck + `docker compose up -d --wait` để migrate không chạy
  trước khi Postgres sẵn sàng.

## Session Notes

- Unit 07 trên nhánh `feat/07-register-joi` hoàn tất: `npm run lint:fix` PASS; `npm run check` PASS
  (lint/typecheck sạch, 5 suites / 28 unit tests); `npm run db:up` PASS (container healthy);
  `npm run db:deploy` PASS (không có migration pending); `npm run test:integration` PASS
  (2 suites / 12 tests).
- Unit 07 HTTP verify: server nghe tại `127.0.0.1:3000`; `Invoke-RestMethod` đăng ký user trả
  201 với role `user` và không trả `passwordHash`; duplicate email trả 409 cùng message chung;
  `role: admin` trả 400; mật khẩu 7 ký tự trả 400 với details field `password`. PostgreSQL query
  xác nhận role `user` và hash bắt đầu `$2b$`; các user test đã được xóa.
- User xác nhận Prisma Studio: user đăng ký có role `user` và `passwordHash` bắt đầu bằng `$2b$`.
- User xác nhận trên máy mình: `npm run check` PASS (lint sạch, typecheck OK, 4 suites và 18
  unit tests PASS). Lỗi TS18046 ở `src/plugins/errorHandler.ts` đã được sửa bằng cách định kiểu
  lỗi là `FastifyError` và lấy tên lỗi từ `http.STATUS_CODES`.
- User xác nhận `npm run dev` nghe tại `127.0.0.1:3000`; `GET /health` trả `status: ok`; route
  không tồn tại trả 404 theo định dạng lỗi chung; `PORT=abc` báo lỗi cấu hình.
- Đã kiểm tra phạm vi Unit 06: chưa thêm route auth.
- Docker Desktop phải đang chạy trước `npm run db:up`.
- Kết quả chạy thực tế do user cung cấp trên Windows (Docker khả dụng): `docker compose ps` báo
  `training-postgres` healthy, `0.0.0.0:5433->5432/tcp`; `npm run db:deploy` áp dụng migration
  `20261001000000_init_users` thành công; `npm run db:seed` chạy hai lần đều báo
  `Seeded admin: admin@example.com (admin)`; `npm run db:verify` có 10 PASS và kết thúc
  `TẤT CẢ ĐẠT`; integration test 6 passed (1 suite); `npm run check` gồm lint OK, typecheck OK
  (Prisma Client 6.19.3), unit tests 10 passed.
- P1000 trước đó do PostgreSQL khác (PID 7352) lắng nghe host port 5432 khiến Prisma kết nối
  nhầm. Đã đổi host port sang 5433 trong `.env`, `.env.example` và `docker-compose.yml`;
  PostgreSQL trong container vẫn dùng port 5432.
- Các kết quả thực tế trên máy user ở trên thay cho ghi chú sandbox cũ về Docker bị chặn.
- Chẩn đoán Windows (2026-10-02): `netstat -ano | findstr :5432` thấy listener PID 7352
  (`postgres`) và PID 21776 (`com.docker.backend`). `.env` ban đầu đặt `POSTGRES_PORT=5432`
  và `DATABASE_URL` port 5432; giả thuyết có PostgreSQL khác chiếm host port được xác nhận.
- Đã đổi `.env`, `.env.example` và mặc định Compose sang host port 5433 (container giữ port 5432).
- Xác minh Docker/DB trong sandbox chưa chạy được: Docker CLI báo `permission denied while trying
  to connect to the Docker API at npipe:////./pipe/docker_engine` (cũng cảnh báo không đọc được
  `C:\Users\ADMIN\.docker\config.json`). Không đánh dấu kiểm tra DB nào là đạt.
- Chưa chạy được: `docker compose down`, `npm run db:up`, `docker compose ps`, `npm run db:deploy`,
  hai lượt `npm run db:seed`, `npm run db:verify`, `npm run test:integration`, `npm run check`.
- Khi chạy trên máy local: nếu `db:deploy` sau khi đổi port vẫn lỗi P1000, chỉ khi đó mới chạy
  `docker compose down -v` (xóa volume) rồi làm lại `db:up` và các bước verify.
- Nếu đổi mật khẩu Postgres sau lần chạy đầu: `npm run db:reset` để tạo lại volume.
- Prisma cần tải engine từ `binaries.prisma.sh`; môi trường không có mạng sẽ lỗi
  ở `prisma generate`.
