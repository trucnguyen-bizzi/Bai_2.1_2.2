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

### Bài tập 2.2 — Auth Server (làm sau)

- Fastify HTTP server
- Đăng ký, đăng nhập, quên mật khẩu
- JWT, validate bằng Joi, hash mật khẩu

## Scope

### In Scope

- Bảng `users`, enum `Role`, seed admin (bài 2.1)
- Hạ tầng local bằng Docker Compose

### Out of Scope (ở giai đoạn bài 2.1)

- HTTP API, JWT, Joi (bài 2.2)
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
