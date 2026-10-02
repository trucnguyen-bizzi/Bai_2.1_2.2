# Unit 03: Prisma schema và migration

## Goal

Bảng `users` được tạo bằng Prisma migration, với `role` chỉ nhận `admin` hoặc `user`
(mặc định `user`), `email` và `username` không trùng. Chưa seed dữ liệu.

## Design

Mô hình dữ liệu theo `context/architecture.md`, mục Data Model. Tên bảng và cột trong DB
dùng snake_case bằng `@map`; field trong code dùng camelCase.

## Implementation

### prisma/schema.prisma
- `generator client` (`prisma-client-js`), `datasource db` (postgresql, `env("DATABASE_URL")`).
- `enum Role { admin user }`.
- `model User`: `id` (uuid, `@db.Uuid`), `email` (unique), `username` (unique),
  `passwordHash` (`@map("password_hash")`), `role` (default `user`), `createdAt`,
  `updatedAt` (`@updatedAt`); `@@map("users")`.

### Migration
- Thư mục `prisma/migrations/<timestamp>_init_users/migration.sql` và `migration_lock.toml`.
- Tạo bằng `npx prisma migrate dev --name init_users` (hoặc dùng bản viết sẵn trong gói và
  áp bằng `migrate deploy`). Phải commit, không sửa tay sau khi đã chạy.

### Scripts
- `db:generate`, `db:migrate`, `db:deploy`, `db:studio`.

## Dependencies

- `prisma@6` (dev), `@prisma/client@6`. Không nâng Prisma 7 khi chưa được yêu cầu.

## Verify when done

- [ ] `npx prisma validate` không lỗi
- [ ] `npm run db:deploy` (hoặc `db:migrate`) chạy thành công
- [ ] `\d users` trong psql thấy đủ cột, PK, hai unique index (email, username)
- [ ] Đã đọc `migration.sql` và giải thích được từng câu lệnh
- [ ] Chèn `role = 'superadmin'` bằng SQL bị DB từ chối (`invalid input value for enum "Role"`)
- [ ] Không có API hay code ứng dụng nào được thêm trong unit này
