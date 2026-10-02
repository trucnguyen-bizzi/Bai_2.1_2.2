# Unit 08: Đăng nhập + JWT

## Goal

`POST /auth/login` kiểm tra username và mật khẩu, trả JWT (access token) khi đúng. Mọi lỗi đăng nhập
trả cùng một response để không lộ username nào tồn tại.

## Design

```
src/
  plugins/jwtPlugin.ts         # default export (fastify-plugin): đăng ký @fastify/jwt
  modules/auth/authSchemas.ts  # thêm loginSchema
  modules/auth/authService.ts  # thêm loginUser(prisma, input)
  types/fastify.d.ts           # khai báo kiểu payload JWT: { sub: string; role: Role }
```

Endpoint:

| | |
|---|---|
| Request | `POST /auth/login`, body `{ username, password }` |
| 200 | `{ "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": <giây> }` |
| 400 | Payload sai (Joi), cùng định dạng ở unit 07 |
| 401 | Sai username hoặc mật khẩu: `{ statusCode: 401, error: "Unauthorized", message: "Invalid username or password" }` |

JWT:
- Thuật toán `HS256`, khai báo tường minh cả lúc ký và lúc verify (`verify.algorithms: ["HS256"]`).
- Payload: `{ sub: <user id>, role: <role> }` cùng `iat`, `exp`. **Không** đưa email, hash hay dữ liệu nhạy
  cảm vào payload (payload chỉ được mã hoá base64, không bảo mật).
- Thời hạn mặc định `15m`. Chưa có refresh token (ghi vào Open Questions).
- Quyết định: đăng nhập bằng `username` + `password` (khớp yêu cầu "validate username, password" trong file kế hoạch).

## Implementation

### getEnv (mở rộng)
- Thêm `jwtSecret` từ `JWT_SECRET` (bắt buộc, tối thiểu 32 ký tự) và `jwtExpiresIn` từ `JWT_EXPIRES_IN` (mặc định `15m`).
- Server từ chối khởi động nếu thiếu hoặc quá ngắn. Khi `nodeEnv === "production"`, từ chối giá trị mẫu trong `.env.example`.
- `.env.example` chứa giá trị mẫu rõ ràng là giả, kèm lệnh sinh secret:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. `.env` dùng secret sinh ngẫu nhiên.

### jwtPlugin
- `app.register(fastifyJwt, { secret, sign: { expiresIn, algorithm: "HS256" }, verify: { algorithms: ["HS256"] } })`.
- Dùng `fastify-plugin` để `app.jwt` có ở mọi route.

### authService.loginUser
- Tìm user theo `username`; dùng lại `verifyPassword` của bài 2.1.
- **Chống lộ thông tin qua thời gian phản hồi:** khi không tìm thấy user, vẫn gọi `verifyPassword` với một hash
  bcrypt giả (tính một lần, dùng lại), để thời gian phản hồi không cho biết username có tồn tại hay không.
- Trả user nếu đúng, `null` nếu sai.

### authRoutes
- `POST /auth/login`: nếu service trả `null` thì 401 với message chung ở trên; nếu đúng thì
  `app.jwt.sign({ sub: user.id, role: user.role })`; `expiresIn` tính bằng `exp - iat` của token vừa ký.
- Response không chứa `passwordHash` hay user object đầy đủ.

### Tests
- `tests/unit/getEnv.test.ts`: thiếu `JWT_SECRET`, secret ngắn hơn 32 ký tự bị từ chối; giá trị mặc định `15m`.
- `tests/integration/login.test.ts`: 200 và token giải mã ra `sub` = id user, `role` đúng, **không có** `passwordHash`/email;
  sai mật khẩu và username không tồn tại trả 401 với **cùng message**; thiếu field trả 400;
  token ký bằng secret khác bị `jwtVerify` từ chối.

## Dependencies

- `@fastify/jwt@10` (ký và verify JWT trong Fastify)

## Verify when done

- [ ] `npm run check` và `npm run test:integration` đạt
- [ ] Đăng nhập admin (`admin` / mật khẩu trong `.env`) trả `accessToken`
- [ ] Dán token vào jwt.io (hoặc giải mã base64 phần giữa): thấy `sub`, `role`, `iat`, `exp`; không thấy hash hay email
- [ ] Sai mật khẩu và username không tồn tại cho response giống hệt nhau
- [ ] Xoá `JWT_SECRET` khỏi `.env` thì server từ chối khởi động với thông báo rõ ràng
- [ ] `.env` không bị commit; `.env.example` chỉ chứa secret mẫu giả

## Out of scope

Refresh token, đăng xuất, thu hồi token, đăng nhập bằng email, khoá tài khoản sau nhiều lần sai.
