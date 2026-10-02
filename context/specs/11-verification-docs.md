# Unit 11: Kiểm chứng đầu-cuối và tài liệu API

## Goal

Chứng minh cả 5 yêu cầu của bài 2.2 đã đạt bằng một test luồng đầu-cuối chạy lặp lại được, và có tài liệu API
đủ để người khác gọi thử. Unit này không thêm tính năng mới.

## Design

Một test chạy trọn vòng đời người dùng qua `app.inject`, và một mục tài liệu API trong README.

## Implementation

### Test luồng đầu-cuối
- `tests/integration/authFlow.test.ts`: đăng ký → đăng nhập → `GET /me` → `forgot-password` (lấy token qua
  hàm service để không phụ thuộc log) → `reset-password` → đăng nhập bằng mật khẩu mới → mật khẩu cũ bị từ chối.
- Dữ liệu dùng email tiền tố `it-`, tự dọn trước và sau.

### Tài liệu API (README.md, mục "API")
- Bảng endpoint: phương thức, đường dẫn, cần token không, role, mã trạng thái trả về.
- Ví dụ gọi bằng PowerShell (`Invoke-RestMethod`) cho: health, register, login, `/me` với header Bearer, forgot/reset.
- Danh sách biến môi trường mới: `PORT`, `HOST`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `RESET_TOKEN_TTL_MINUTES`.
- Mục "Giới hạn đã biết": không có refresh token, không rate limit, role nằm trong token, email chưa gửi thật,
  username phân biệt hoa thường.

### Nghiệm thu bài 2.2
- Trong `context/progress-tracker.md`, ghi bảng ánh xạ 5 yêu cầu của bài vào unit và bằng chứng kiểm chứng thật.
- Cập nhật `AGENTS.md` (lệnh `dev`, `start`, biến môi trường) và `context/architecture.md` nếu thực tế khác spec.

## Dependencies

Không có gói mới.

## Verify when done

- [ ] `npm run check` đạt
- [ ] `npm run test:integration` đạt, gồm test luồng đầu-cuối
- [ ] Làm theo các ví dụ PowerShell trong README từ đầu đến cuối đều chạy đúng
- [ ] Bảng nghiệm thu: #1 Fastify, #2 đăng ký/đăng nhập/quên mật khẩu, #3 JWT cấp và xác thực, #4 Joi, #5 hash mật khẩu —
      mỗi mục có bằng chứng (lệnh và kết quả thật)
- [ ] `.env` không bị commit

## Out of scope

Deploy, Docker hoá ứng dụng, CI, Swagger.
