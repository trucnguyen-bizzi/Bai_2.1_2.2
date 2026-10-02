# Auth Training Server

## Overview

Backend xác thực người dùng, được xây dựng trong khuôn khổ training
Tuần 1 (Ngày 2). Dành cho thực tập sinh/junior học các công nghệ nền
tảng: TypeScript, PostgreSQL, Prisma, Fastify, JWT, Joi. Bài tập 2.1
dựng database; bài tập 2.2 xây Auth API trên nền database đó.

## Goals

1. Chạy được PostgreSQL local bằng Docker Compose
2. Quản lý cấu trúc database hoàn toàn bằng Prisma migration
3. Có bảng `users` với role `admin` hoặc `user`
4. Có sẵn 1 tài khoản admin được seed, mật khẩu đã hash
5. Hiểu rõ từng file do tool/AI sinh ra (đặc biệt migration.sql, seed.ts)

## Core User Flow (toàn bộ Ngày 2)

1. Developer chạy `docker compose up -d` để có Postgres
2. Developer chạy migration để tạo bảng `users`
3. Developer chạy seed để có tài khoản admin
4. (Bài 2.2) Người dùng đăng ký / đăng nhập qua API, nhận JWT
5. (Bài 2.2) Người dùng gọi API cần xác thực bằng JWT

## Features

### Bài tập 2.1 — Database

- Init project Node.js + TypeScript
- Docker Compose chạy PostgreSQL
- Prisma schema + migration
- Bảng `users`, enum `Role` (`admin`, `user`)
- Seed admin user

### Bài tập 2.2 — Auth Server (spec Unit 06–11 đã viết)

Yêu cầu theo file kế hoạch:

1. Fastify: server HTTP
2. Quản lý người dùng: lưu trong DB của bài 2.1; đăng ký, đăng nhập, quên mật khẩu
3. JWT: cấp token khi đăng nhập thành công; xác thực token ở các request sau
4. Joi: validate payload (username, password, ...) trước khi xử lý
5. Bảo mật: hash mật khẩu trước khi lưu

Endpoint: `GET /health`, `POST /auth/register`, `POST /auth/login`, `GET /me`, `GET /users` (admin),
`POST /auth/forgot-password`, `POST /auth/reset-password`.

## Scope

### In Scope

- Bảng `users`, enum `Role`, seed admin (bài 2.1)
- Hạ tầng local bằng Docker Compose
- Auth API với Fastify, JWT, Joi (bài 2.2)

### Out of Scope

- Refresh token, đăng xuất/thu hồi token, rate limit, gửi email thật, xác minh email, Swagger (bài 2.2)
- GraphQL (Ngày 3)
- Bảng invoice (Ngày 4)
- Deploy lên cloud / LocalStack (Tuần 2)

## Success Criteria

1. `docker compose up -d` chạy Postgres thành công, `docker compose ps` báo running
2. `npx prisma migrate dev` tạo bảng `users` và thư mục `prisma/migrations` có migration tương ứng
3. Cột `role` chỉ nhận `admin` / `user`, mặc định `user`
4. `npx prisma db seed` tạo 1 admin; chạy lại nhiều lần không lỗi và không tạo dòng trùng
5. Mật khẩu admin trong DB là bcrypt hash (bắt đầu bằng `$2b$`), không phải plain text
6. `npm run db:verify` in "TẤT CẢ ĐẠT"
7. `npm run check` (lint + format + typecheck + unit test) không báo lỗi
8. `npm run test:integration` đạt trên Postgres đã migrate
9. `.env` không bị commit lên git

### Tiêu chí thành công bài 2.2

1. `npm run dev` chạy server Fastify; `GET /health` trả `status: ok`
2. Đăng ký tạo user role `user`, mật khẩu lưu dạng bcrypt hash; trùng email/username trả 409
3. Đăng nhập đúng trả JWT; sai thông tin trả 401 cùng một message
4. `GET /me` cần token hợp lệ; không token, token sai hoặc hết hạn trả 401
5. `GET /users` chỉ admin gọi được (user thường bị 403)
6. Mọi payload sai bị Joi chặn với 400 kèm `details`; payload đăng ký có `role` bị từ chối
7. Quên mật khẩu: token lưu dạng hash, dùng một lần, có hạn; response không lộ email có tồn tại hay không
8. `npm run check` và `npm run test:integration` đạt
