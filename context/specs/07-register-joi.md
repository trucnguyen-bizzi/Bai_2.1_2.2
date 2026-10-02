# Unit 07: Đăng ký + validate bằng Joi

## Goal

`POST /auth/register` tạo user mới sau khi payload được Joi validate; mật khẩu luôn được hash
trước khi lưu; role luôn là `user`; trùng email hoặc username trả 409. Joi trở thành validator
chung của toàn bộ route.

## Design

```
src/
  plugins/joiValidator.ts          # default export (fastify-plugin): setValidatorCompiler dùng Joi
  modules/auth/authSchemas.ts      # named exports: registerSchema (các schema khác thêm ở unit sau)
  modules/auth/authService.ts      # named exports: registerUser(prisma, input)
  modules/auth/authRoutes.ts       # default export: plugin chứa route /auth/*
  modules/users/toPublicUser.ts    # default export: bỏ passwordHash và mọi trường nhạy cảm
```

Endpoint:

| | |
|---|---|
| Request | `POST /auth/register`, body `{ email, username, password }` |
| 201 | `{ "user": { id, email, username, role, createdAt } }` (không có `passwordHash`) |
| 400 | Payload sai: `{ statusCode: 400, error: "Bad Request", message: "Validation failed", details: [{ field, message }] }` |
| 409 | Trùng: `{ statusCode: 409, error: "Conflict", message: "Email or username already in use" }` |

Quy tắc Joi cho `registerSchema`:
- `email`: chuỗi, đúng định dạng email, tối đa 254 ký tự, tự chuyển về chữ thường và trim.
- `username`: 3–30 ký tự, chỉ chữ, số, gạch dưới (`^[a-zA-Z0-9_]+$`), trim.
- `password`: 8–64 ký tự, bắt buộc.
- **Không cho field lạ** (ví dụ `role`): payload có field ngoài ba field trên bị 400. Client không được tự chọn role.

## Implementation

### joiValidator
- `app.setValidatorCompiler(({ schema }) => (data) => ...)` gọi `schema.validate(data, { abortEarly: false })`;
  trả `{ value }` nếu hợp lệ (dùng giá trị đã chuẩn hoá) hoặc `{ error }`.
- Route khai báo `schema: { body: registerSchema }` (schema là đối tượng Joi, không phải JSON Schema).

### errorHandler (bổ sung từ unit 06)
- Nhận biết lỗi validate bằng `error.code === "FST_ERR_VALIDATION"` (đã kiểm chứng: với validator Joi
  tự viết thì `error.validation` bị rỗng, nên không dùng nó).
- Lấy chi tiết từ `error.details` của Joi, trả `details: [{ field: path.join("."), message }]`.
- JSON body hỏng (`FST_ERR_CTP_INVALID_JSON_BODY`) trả 400 theo định dạng lỗi chung.

### authService.registerUser
- Nhận `prisma` làm tham số (như `seedAdmin`), dùng lại `hashPassword` của bài 2.1.
- Kiểm tra trùng email hoặc username trước; ngoài ra bắt lỗi Prisma `P2002` để xử lý hai request đăng ký
  đồng thời (race condition), cả hai trường hợp đều trả 409 cùng một message.
- Tạo user với `role: Role.user` (hằng cố định trong service, không đọc từ input).

### authRoutes và buildApp
- `app.post("/auth/register", { schema: { body: registerSchema } }, handler)`; handler chỉ gọi service,
  trả `toPublicUser(user)`; không chứa logic nghiệp vụ.
- `buildApp` đăng ký `joiValidator` trước các route.

### Tests
- `tests/unit/authSchemas.test.ts`: email hợp lệ/sai, chuẩn hoá chữ thường, username quá ngắn/quá dài/ký tự lạ,
  mật khẩu quá ngắn/quá dài, field lạ (`role`) bị từ chối, thiếu field bị từ chối.
- `tests/integration/register.test.ts` (dùng `app.inject`, dữ liệu email tiền tố `it-`, tự dọn):
  201 và response không có `passwordHash`; `passwordHash` trong DB bắt đầu `$2` và khác mật khẩu gốc;
  role trong DB là `user`; gửi `role: "admin"` trả 400 và không tạo user; trùng email trả 409;
  trùng username trả 409; email viết hoa được lưu chữ thường; payload sai trả 400 kèm `details`.

## Dependencies

- `joi@18` (validate dữ liệu đầu vào)

## Verify when done

- [ ] `npm run check` không lỗi
- [ ] `npm run test:integration` đạt (cần Postgres đang chạy và đã migrate)
- [ ] Đăng ký bằng `Invoke-RestMethod` trả 201; trong Prisma Studio user mới có `role = user` và `passwordHash` dạng `$2b$...`
- [ ] Gửi `role: "admin"` bị 400; tài khoản không được tạo
- [ ] Đăng ký lại cùng email trả 409 với message không nói cụ thể trường nào bị trùng
- [ ] Mật khẩu 7 ký tự trả 400 với `details` chỉ rõ field `password`

## Out of scope

Đăng nhập, JWT, xác minh email, giới hạn tần suất gọi (rate limit).
