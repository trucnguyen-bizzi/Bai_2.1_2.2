# Unit 10: Quên mật khẩu

## Goal

User quên mật khẩu có thể yêu cầu token đặt lại (`forgot-password`) và đặt mật khẩu mới bằng token đó
(`reset-password`). Token chỉ được lưu dưới dạng hash, chỉ dùng được một lần và có hạn dùng.
Việc gửi email thật nằm ngoài phạm vi: ở môi trường không phải production, token được ghi ra log thay cho email.

## Design

Unit này **đổi schema DB** nên là unit duy nhất tạo migration mới ở bài 2.2.

Schema (thêm vào `model User`):

```prisma
resetTokenHash      String?   @unique @map("reset_token_hash")
resetTokenExpiresAt DateTime? @map("reset_token_expires_at")
```

Migration kỳ vọng (tên `add_password_reset_to_users`):

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_token_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_hash_key" ON "users"("reset_token_hash");
```

Endpoint:

| | |
|---|---|
| `POST /auth/forgot-password` | Body `{ email }`. Luôn trả `202 { message: "If the email exists, a reset link has been sent." }`, dù email có tồn tại hay không |
| `POST /auth/reset-password` | Body `{ token, password }`. Thành công: `200 { message: "Password has been reset." }`. Token sai, hết hạn hoặc đã dùng: `400 { message: "Invalid or expired token" }` (cùng một message) |

Quy tắc bảo mật:
- Token = `crypto.randomBytes(32).toString("hex")` (64 ký tự hex). DB chỉ lưu SHA-256 của token. Dùng SHA-256 thay vì
  bcrypt vì token đã đủ ngẫu nhiên, và cần tra cứu trực tiếp theo hash.
- Hạn dùng mặc định 15 phút (`RESET_TOKEN_TTL_MINUTES`). Tạo token mới thì ghi đè token cũ.
- **Single-use:** đặt lại thành công thì xoá `resetTokenHash` và `resetTokenExpiresAt`.
- Mật khẩu mới cũng được hash bằng `hashPassword` và qua cùng luật Joi như đăng ký.
- Response của `forgot-password` không được lộ email có tồn tại hay không.

## Implementation

```
src/
  modules/auth/resetToken.ts          # named exports: generateResetToken(), hashResetToken(token)
  lib/sendPasswordResetEmail.ts       # default export: ghi log (không gửi email thật)
  modules/auth/authService.ts         # thêm requestPasswordReset, resetPassword
  modules/auth/authSchemas.ts         # thêm forgotPasswordSchema, resetPasswordSchema
```

### Schema và migration
- Sửa `prisma/schema.prisma`, tạo migration bằng `npm run db:migrate -- --name add_password_reset_to_users`.
- Nếu môi trường không có Docker (ví dụ sandbox của Codex), tạo thư mục migration và `migration.sql` đúng nội dung kỳ vọng ở trên,
  rồi **ghi rõ trong báo cáo** là chưa áp dụng. Người dùng sẽ chạy `npm run db:deploy`, sau đó `npm run db:migrate` phải báo
  `Already in sync` (không còn drift giữa schema và migration).
- Không sửa migration `init_users`.

### getEnv (mở rộng)
- Thêm `resetTokenTtlMinutes` từ `RESET_TOKEN_TTL_MINUTES` (số nguyên 1–1440, mặc định 15).

### Joi
- `forgotPasswordSchema`: `{ email }` (chuẩn hoá chữ thường).
- `resetPasswordSchema`: `{ token: hex đúng 64 ký tự, password: 8–64 ký tự }`; không cho field lạ.

### authService
- `requestPasswordReset(prisma, email, ttlMinutes, now = new Date())`: nếu có user thì tạo token, lưu hash và hạn, trả `{ user, token }`;
  nếu không thì trả `null`. Route luôn trả 202 như nhau.
- `resetPassword(prisma, { token, password }, now = new Date())`: tìm user có `resetTokenHash` khớp và `resetTokenExpiresAt > now`;
  cập nhật `passwordHash` và xoá hai cột reset bằng `updateMany` có điều kiện `resetTokenHash` (để hai request đồng thời chỉ một
  request thành công); trả `true` nếu `count === 1`, ngược lại `false`.

### sendPasswordResetEmail
- Nhận logger, email và token. Chỉ ghi log khi `nodeEnv !== "production"`. Đây là **ngoại lệ có chủ đích** của quy tắc
  "không log token" (token thay cho email trong môi trường dev); ở production hàm không log gì.
- Token không bao giờ nằm trong response HTTP.

### Tests
- `tests/unit/resetToken.test.ts`: token dài 64 ký tự hex, hai lần sinh khác nhau, hash khác token và ổn định với cùng đầu vào.
- `tests/integration/passwordReset.test.ts`: `forgot-password` trả cùng response cho email tồn tại và không tồn tại;
  DB lưu hash (khác token, không chứa token); reset thành công thì đăng nhập bằng mật khẩu cũ thất bại và mật khẩu mới thành công;
  dùng lại token lần hai trả 400; token hết hạn (đặt `resetTokenExpiresAt` trong quá khứ) trả 400; token ngẫu nhiên đúng định dạng trả 400;
  mật khẩu mới quá ngắn trả 400 và token vẫn dùng được; yêu cầu `forgot-password` lần hai làm token đầu vô hiệu.

## Dependencies

Không có gói mới (dùng `crypto` có sẵn của Node).

## Verify when done

- [ ] `npm run db:deploy` áp migration thành công; `npm run db:migrate` báo `Already in sync`
- [ ] `\d users` trong psql có thêm hai cột reset và unique index
- [ ] `npm run check` và `npm run test:integration` đạt
- [ ] Chạy `forgot-password`: log server in token; response HTTP không chứa token
- [ ] Trong Prisma Studio, cột `resetTokenHash` là chuỗi hex khác token vừa in ra log
- [ ] Đặt lại mật khẩu bằng token thành công, đăng nhập bằng mật khẩu mới được, dùng lại token lần hai bị 400
- [ ] Gọi `forgot-password` với email không tồn tại cho response giống hệt email có thật

## Out of scope

Gửi email thật, giao diện đặt lại mật khẩu, giới hạn số lần yêu cầu (rate limit), thu hồi JWT cũ khi đặt lại mật khẩu
(giới hạn đã biết: token đăng nhập đã cấp vẫn dùng được đến khi hết hạn).
