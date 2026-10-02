# Auth Training — Bài tập 2.1: Postgres + Prisma

Project hoàn chỉnh cho Tuần 1 / Ngày 2 / Bài tập 2.1.

## Yêu cầu

- Node.js >= 20
- Docker Desktop (đang chạy) với `docker compose`
- Truy cập mạng (Prisma tải engine lần đầu)

## Chạy nhanh

```bash
npm install
cp .env.example .env     # đã có sẵn .env trong gói này, bỏ qua nếu tồn tại
npm run setup
```

Kiểm tra: `npm run check` (ESLint + Prettier + typecheck + unit test). Tự sửa lỗi lint/format: `npm run lint:fix`.
Test: `npm test` (unit, không cần DB) và `npm run test:integration` (cần Postgres đã chạy và migrate).

### Lỗi hay gặp trên Windows

Nếu container Postgres báo `Healthy` nhưng Prisma gặp lỗi `P1000`, có thể một PostgreSQL khác
đang dùng host port 5432. Đặt `POSTGRES_PORT=5433` và đổi port trong `DATABASE_URL` thành `5433`
trong `.env` (container vẫn nghe ở port 5432).

`npm run setup` sẽ: generate Prisma Client → chạy Postgres → áp migration → seed admin → chạy kiểm tra tự động.
Kết quả mong đợi là các dòng `PASS` và `TẤT CẢ ĐẠT`.

Tài khoản admin mặc định (đổi trong `.env`): `admin@example.com` / `Admin@123456`.

## Map với 5 yêu cầu của bài

| # | Yêu cầu | File |
|---|---|---|
| 1 | Init project Node.js + TypeScript | `package.json`, `tsconfig.json` |
| 2 | Prisma cho migration | `prisma/schema.prisma`, `prisma/migrations/` |
| 3 | Docker Compose chạy Postgres | `docker-compose.yml` |
| 4 | Table user, migration, seed admin | `prisma/migrations/.../migration.sql`, `prisma/seed.ts` |
| 5 | Role admin / user | `enum Role` trong schema (ràng buộc ở tầng DB) |

## Cấu trúc

```
├── AGENTS.md              # hướng dẫn cho Codex
├── CLAUDE.md              # hướng dẫn cho Claude Code
├── context/               # 6 file Six-File Context
│   └── specs/             # build plan và spec từng unit (00–05)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/        # commit, không sửa tay
│   └── seed.ts
├── scripts/verify-db.ts   # kiểm tra tích hợp bài 2.1 (in PASS/FAIL)
├── src/                   # code ứng dụng (dùng cho bài 2.2)
│   ├── config/            # đọc và validate cấu hình
│   └── lib/               # prisma, hashPassword, verifyPassword, seedAdmin
├── tests/
│   ├── unit/              # Jest, không cần DB
│   └── integration/       # Jest, cần Postgres
├── docker-compose.yml
├── .env / .env.example
├── eslint.config.mjs      # ESLint theo coding standard của team
├── .prettierrc.json, .editorconfig
└── package.json, tsconfig.json
```

## Ghi chú

- Dùng Prisma 6. Khi chạy, Prisma báo `package.json#prisma is deprecated`: chỉ là cảnh báo cho Prisma 7, không ảnh hưởng.
- Migration `init_users` được viết sẵn đúng định dạng Prisma. Nếu bạn sửa schema, tạo migration mới bằng `npm run db:migrate -- --name ten_migration`.
- Gói này đã có `.env` với giá trị training. `.env` nằm trong `.gitignore`, không commit.
- Sang bài 2.2: bổ sung Fastify, JWT, Joi vào `context/architecture.md` và `context/code-standards.md`, rồi code trong `src/`.
