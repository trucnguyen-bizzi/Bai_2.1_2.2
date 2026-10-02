# Unit 06: Fastify skeleton

## Goal

Có một server HTTP Fastify 5 chạy được bằng `npm run dev`, có `GET /health`, cấu hình đọc và
kiểm tra từ biến môi trường, Prisma dùng chung qua plugin, và error handler thống nhất.
Chưa có route đăng ký, đăng nhập hay JWT.

## Design

Cấu trúc thư mục (mỗi file một default export, tên file trùng tên hàm theo mục 23.6, 23.7):

```
src/
  index.ts                  # điểm vào: build app, listen, tắt server êm khi nhận SIGINT/SIGTERM
  buildApp.ts               # default export buildApp(): tạo FastifyInstance, đăng ký plugin và route
  config/getEnv.ts          # default export getEnv(env): đọc và validate cấu hình
  plugins/prismaPlugin.ts   # default export (fastify-plugin): app.prisma, $disconnect khi onClose
  plugins/errorHandler.ts   # default export (fastify-plugin): setErrorHandler và setNotFoundHandler
  routes/healthRoutes.ts    # default export: GET /health
  types/fastify.d.ts        # khai báo kiểu: app.prisma
```

Định dạng lỗi thống nhất cho mọi route: `{ "statusCode": 404, "error": "Not Found", "message": "..." }`.
Lỗi 5xx trả message chung `Internal Server Error`; chi tiết chỉ ghi vào log phía server,
không lộ stack trace ra response.

## Implementation

### getEnv
- `getEnv(env: NodeJS.ProcessEnv = process.env)` trả `{ nodeEnv, port, host }`.
- `NODE_ENV`: `development` | `test` | `production`, mặc định `development`; giá trị khác thì ném lỗi.
- `PORT`: số nguyên 1–65535, mặc định `3000`. `HOST`: mặc định `127.0.0.1`.
- Giá trị không hợp lệ phải ném lỗi rõ ràng (server không được chạy với cấu hình sai).

### buildApp
- `buildApp(options?: { logger?: boolean })` trả `FastifyInstance` đã `ready`-able (không listen).
- Bật logger khi `nodeEnv !== "test"`.
- Đăng ký `errorHandler`, `prismaPlugin`, `healthRoutes`.

### prismaPlugin
- Dùng PrismaClient dùng chung từ `src/lib/prisma.ts` (không tạo client mới).
- `app.decorate("prisma", prisma)` và hook `onClose` gọi `prisma.$disconnect()`.

### healthRoutes
- `GET /health` trả `200 { "status": "ok" }`. Không truy vấn database.

### index.ts và scripts
- Đọc `getEnv()`, `buildApp()`, `listen({ port, host })`; lỗi khởi động thì log và `process.exit(1)`.
- Thay nội dung cũ của `src/index.ts` (script đếm user) bằng điểm vào server.
- `package.json`: thêm `"dev": "tsx watch src/index.ts"`, giữ `"start": "tsx src/index.ts"`.
- `.env`, `.env.example`: thêm `PORT=3000`, `HOST=127.0.0.1`.
- Cập nhật bảng lệnh trong `AGENTS.md` và README: `npm run dev`, `npm start`.

### Tests
- `tests/unit/getEnv.test.ts`: giá trị mặc định, đọc env, từ chối `PORT` sai (chữ, 0, 70000) và `NODE_ENV` sai.
- `tests/unit/health.test.ts`: dùng `app.inject` — `GET /health` trả 200 `{ status: "ok" }`;
  `GET /khong-ton-tai` trả 404 đúng định dạng lỗi chung. Đóng app bằng `app.close()` sau test.

## Dependencies

- `fastify@5`, `fastify-plugin` (server và cách đóng gói plugin)

## Verify when done

- [ ] `npm run check` không lỗi (lint, typecheck, unit test)
- [ ] `npm run dev` khởi động, log cho thấy server nghe ở `127.0.0.1:3000`
- [ ] `Invoke-RestMethod http://127.0.0.1:3000/health` trả `status: ok`
- [ ] Gọi đường dẫn không tồn tại trả 404 đúng định dạng `{ statusCode, error, message }`
- [ ] `PORT=abc npm run dev` báo lỗi cấu hình rõ ràng và thoát (không chạy)
- [ ] Nhấn Ctrl+C: server tắt êm, không báo lỗi
- [ ] Không có route auth nào được thêm trong unit này

## Out of scope

Joi, JWT, route đăng ký/đăng nhập, CORS, rate limit, Swagger.
