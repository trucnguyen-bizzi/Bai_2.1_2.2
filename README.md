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

Chạy Fastify server: `npm run dev` (watch) hoặc `npm start`. Mặc định server nghe tại
`127.0.0.1:3000`; có thể cấu hình bằng `HOST` và `PORT` trong `.env`.

### Lỗi hay gặp trên Windows

Nếu container Postgres báo `Healthy` nhưng Prisma gặp lỗi `P1000`, có thể một PostgreSQL khác
đang dùng host port 5432. Đặt `POSTGRES_PORT=5433` và đổi port trong `DATABASE_URL` thành `5433`
trong `.env` (container vẫn nghe ở port 5432).

`npm run setup` sẽ: generate Prisma Client → chạy Postgres → áp migration → seed admin → chạy kiểm tra tự động.
Kết quả mong đợi là các dòng `PASS` và `TẤT CẢ ĐẠT`.

Tài khoản admin mặc định (đổi trong `.env`): `admin@example.com` / `Admin@123456`.

## API

Chạy Postgres và áp dụng migration trước, sau đó khởi động server bằng `npm run dev`. Mặc định API
nghe tại `http://127.0.0.1:3000`.

| Method | Endpoint | Xác thực / role | Thành công | Lỗi chính |
|---|---|---|---|---|
| GET | `/health` | Không | `200` | — |
| POST | `/auth/register` | Không | `201` | `400` payload sai, `409` email/username đã dùng |
| POST | `/auth/login` | Không | `200` có access token | `400` payload sai, `401` thông tin đăng nhập sai |
| GET | `/me` | Bearer token | `200` user hiện tại | `401` token thiếu/sai/hết hạn |
| GET | `/users` | Bearer token, admin | `200` danh sách user | `401` chưa xác thực, `403` không phải admin |
| POST | `/auth/forgot-password` | Không | `202` response chung cho mọi email | `400` payload sai |
| POST | `/auth/reset-password` | Không, cần reset token | `200` | `400` token sai/hết hạn/đã dùng hoặc payload sai |

### Ví dụ PowerShell

```powershell
$baseUrl = "http://127.0.0.1:3000"

# Health
Invoke-RestMethod -Method Get -Uri "$baseUrl/health"

# Register
$registerBody = @{
  email = "person@example.com"
  username = "person_01"
  password = "Training@123"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
  -ContentType "application/json" -Body $registerBody

# Login and call /me with a Bearer token
$loginBody = @{
  username = "person_01"
  password = "Training@123"
} | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
  -ContentType "application/json" -Body $loginBody
$token = $login.accessToken
Invoke-RestMethod -Method Get -Uri "$baseUrl/me" `
  -Headers @{ Authorization = "Bearer $token" }

# An admin token is required for GET /users
$adminLoginBody = @{
  username = "admin"
  password = "Admin@123456"
} | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
  -ContentType "application/json" -Body $adminLoginBody
Invoke-RestMethod -Method Get -Uri "$baseUrl/users" `
  -Headers @{ Authorization = "Bearer $($adminLogin.accessToken)" }

# Forgot password returns the same 202 response whether the email exists or not.
# In development, copy the token printed in the server log; the API response never includes it.
$forgotBody = @{ email = "person@example.com" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/forgot-password" `
  -ContentType "application/json" -Body $forgotBody

$resetToken = "paste-the-64-character-token-from-the-server-log"
$resetBody = @{
  token = $resetToken
  password = "NewTraining@123"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/reset-password" `
  -ContentType "application/json" -Body $resetBody
```

### Biến môi trường của ứng dụng

| Biến | Mặc định / yêu cầu | Mô tả |
|---|---|---|
| `PORT` | `3000` | Cổng HTTP, số nguyên 1–65535 |
| `HOST` | `127.0.0.1` | Địa chỉ bind của server |
| `JWT_SECRET` | Bắt buộc, ít nhất 32 ký tự | Secret ký JWT; không dùng giá trị mẫu trong production |
| `JWT_EXPIRES_IN` | `15m` | Thời hạn access token JWT |
| `RESET_TOKEN_TTL_MINUTES` | `15` | Thời hạn reset token, số nguyên 1–1440 phút |

### Giới hạn đã biết

- Chưa có refresh token; role được giữ trong JWT nên thay đổi role chỉ có hiệu lực với token mới.
- Chưa có rate limit cho đăng nhập hoặc yêu cầu reset mật khẩu.
- Email reset chưa được gửi thật; ngoài production, reset token được ghi trong server log để thử.
- Username phân biệt chữ hoa/chữ thường.

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
