# Unit 04: Seed admin

## Goal

`npm run db:seed` tạo đúng một tài khoản admin với mật khẩu đã hash; chạy lại bao nhiêu
lần cũng không lỗi và không tạo thêm hay ghi đè.

## Design

Logic nằm trong các hàm nhỏ, mỗi file một default export và tên file trùng tên hàm
(mục 10.6, 23.6, 23.7 của coding standard). `prisma/seed.ts` chỉ nối các hàm lại.

## Implementation

### src/lib/hashPassword.ts
- bcrypt, cost 10; ném lỗi nếu mật khẩu rỗng.

### src/lib/verifyPassword.ts
- So khớp mật khẩu với hash bằng `bcrypt.compare`.

### src/config/getAdminSeedConfig.ts
- Đọc `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` từ env (có mặc định cho training).
- Validate: email hợp lệ, username >= 3 ký tự, mật khẩu >= 8 ký tự; sai thì ném lỗi rõ ràng.

### src/lib/seedAdmin.ts
- `upsert` theo email, `update: {}`, `create` với `role: Role.admin`.

### prisma/seed.ts và cấu hình
- Tạo `PrismaClient`, gọi `seedAdmin`, in kết quả, luôn `$disconnect()`.
- `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`; script `db:seed`.
- `src/lib/prisma.ts`: một `PrismaClient` dùng chung (default export).

## Dependencies

- `bcrypt`, `@types/bcrypt` (hash mật khẩu)

## Verify when done

- [ ] `npm run db:seed` in `Seeded admin: admin@example.com (admin)`
- [ ] Chạy seed lần 2 không lỗi, bảng `users` vẫn đúng một dòng admin
- [ ] `passwordHash` trong DB bắt đầu bằng `$2`, không phải mật khẩu thật
- [ ] Đặt `ADMIN_PASSWORD` ngắn hơn 8 ký tự thì seed báo lỗi rõ ràng và không ghi gì vào DB
- [ ] `npm run lint` không lỗi
