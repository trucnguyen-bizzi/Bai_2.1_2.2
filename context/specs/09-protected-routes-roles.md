# Unit 09: Route được bảo vệ + phân quyền theo role

## Goal

Các request sau đăng nhập được xác thực bằng JWT: có `authenticate` để bắt buộc token hợp lệ, `requireRole`
để giới hạn theo role, `GET /me` cho mọi user đăng nhập và `GET /users` chỉ dành cho admin.

## Design

```
src/
  plugins/jwtPlugin.ts            # thêm decorator app.authenticate
  hooks/requireRole.ts            # default export requireRole(...roles): preHandler
  modules/users/userRoutes.ts     # default export: GET /me, GET /users
```

| Endpoint | Điều kiện | Kết quả |
|---|---|---|
| `GET /me` | Có token hợp lệ | 200 `{ user: toPublicUser(user) }`, lấy mới từ DB theo `sub` |
| `GET /users` | Token hợp lệ và role `admin` | 200 `{ users: [toPublicUser...] }` sắp theo `createdAt` |

Mã lỗi:
- Không có token, token sai, hết hạn, ký bằng secret khác, hoặc user trong token không còn tồn tại: **401** `{ message: "Unauthorized" }`
  (cùng một message cho mọi nguyên nhân).
- Token hợp lệ nhưng role không đủ: **403** `{ message: "Forbidden" }`.

Quyết định: `GET /users` là phần tối thiểu để kiểm chứng phân quyền theo role và chuẩn bị cho bài 3.1
(chỉ admin truy vấn toàn bộ người dùng); nằm ngoài danh sách yêu cầu của bài 2.2, có thể bỏ nếu mentor muốn.

## Implementation

### authenticate
- `app.decorate("authenticate", ...)`: gọi `request.jwtVerify()`; lỗi bất kỳ thì trả 401 theo message chung.
- Dùng làm `preHandler`, route khai báo `preHandler: [app.authenticate]`.
- Khai báo kiểu `request.user` là `{ sub: string; role: Role }` để TypeScript kiểm tra được.

### requireRole
- `requireRole("admin")` trả hàm preHandler: nếu `request.user.role` không nằm trong danh sách thì 403.
- Luôn chạy **sau** `authenticate`: `preHandler: [app.authenticate, requireRole("admin")]`.

### userRoutes
- `GET /me`: đọc user theo `request.user.sub`; không thấy thì 401. Không bao giờ trả `passwordHash`.
- `GET /users`: `findMany` sắp theo `createdAt`, map qua `toPublicUser`. Chưa phân trang (ghi chú giới hạn).

### Tests
- `tests/integration/protectedRoutes.test.ts`: `/me` không token trả 401; token rác trả 401; token hết hạn
  (ký với `expiresIn` rất ngắn rồi chờ) trả 401; token đúng trả 200 đúng user, không có `passwordHash`;
  user thường gọi `/users` trả 403; admin gọi `/users` trả 200 và danh sách không có `passwordHash`;
  user bị xoá khỏi DB nhưng token còn hạn thì `/me` trả 401.

## Dependencies

Không có gói mới.

## Verify when done

- [ ] `npm run check` và `npm run test:integration` đạt
- [ ] Đăng nhập admin, gọi `/me` với header `Authorization: Bearer <token>` trả thông tin admin
- [ ] Gọi `/me` không token trả 401
- [ ] Đăng ký một user thường, đăng nhập, gọi `/users` trả 403; dùng token admin trả 200
- [ ] Response của `/me` và `/users` không có trường `passwordHash` hay trường reset token

## Out of scope

Phân trang, cập nhật/xoá user, thu hồi token. Giới hạn đã biết: role nằm trong token nên đổi role của user
chỉ có hiệu lực khi token cũ hết hạn (tối đa 15 phút).
