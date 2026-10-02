# Build Plan — Auth Training Server

Kế hoạch thứ tự các unit cho toàn bộ Ngày 2. Mỗi unit là một việc nhỏ, có kết quả kiểm
chứng được và nằm trong một ranh giới hệ thống. Mỗi unit có file spec riêng
(`NN-ten-unit.md`) gồm Goal, Design, Implementation, Dependencies, Verify when done.

## Quy tắc xếp thứ tự

- **Phụ thuộc đi trước:** unit cần cái gì thì cái đó phải có ở unit trước.
- **Hạ tầng và dữ liệu trước code ứng dụng.**
- **Cài dependency đúng lúc:** chỉ cài gói ở unit mà nó bắt đầu được dùng thật.
- **Một unit, một ranh giới:** không trộn hạ tầng, schema DB và API trong cùng một unit.
- **Bảo mật trước chức năng:** hash mật khẩu, JWT và kiểm tra role có trước các route
  được bảo vệ; luồng quên mật khẩu (đụng schema DB) đặt sau cùng.

## Bài 2.1 — Database (HOÀN THÀNH)

| Unit | Tên | Yêu cầu của bài | Trạng thái |
|---|---|---|---|
| 01 | Project scaffold | #1 | Hoàn thành |
| 02 | Postgres bằng Docker Compose | #3 | Hoàn thành (host port 5433) |
| 03 | Prisma schema và migration | #2, #4 (bảng), #5 | Hoàn thành |
| 04 | Seed admin | #4 (seed) | Hoàn thành |
| 05 | Kiểm chứng tự động | Nghiệm thu #1–#5 | Hoàn thành |

Đã kiểm chứng trên PostgreSQL thật: `db:deploy`, `db:seed` (2 lần), `db:verify` 10 PASS,
`test:integration` 6/6, `npm run check` sạch.

## Bài 2.2 — Auth Server (spec đã viết, chưa làm)

Yêu cầu của bài (file kế hoạch, sheet "Bài tập 2.2"):
1. Sử dụng Fastify: xây server HTTP.
2. Quản lý người dùng: lưu trong DB của bài 2.1; đăng ký, đăng nhập, quên mật khẩu.
3. Sử dụng JWT: tạo token khi đăng nhập thành công; xác thực token ở các request sau.
4. Validate payload: dùng Joi (username, password, ...) trước khi xử lý.
5. Bảo mật: hash mật khẩu trước khi lưu vào DB.

| Unit | Tên | Xây gì | Phụ thuộc | Yêu cầu | Gói cài mới |
|---|---|---|---|---|---|
| 06 | Fastify skeleton | `buildApp`, `getEnv`, plugin Prisma, error handler, `GET /health`, chạy được server | 01–05 | #1 | `fastify`, `fastify-plugin` |
| 07 | Đăng ký + Joi | Joi làm validator của Fastify, `POST /auth/register`, hash mật khẩu, role luôn `user` | 06 | #2, #4, #5 | `joi` |
| 08 | Đăng nhập + JWT | `POST /auth/login`, ký JWT, lỗi đăng nhập không lộ thông tin | 07 | #2, #3 | `@fastify/jwt` |
| 09 | Route bảo vệ + role | `authenticate`, `requireRole`, `GET /me`, `GET /users` (admin) | 08 | #3 | — |
| 10 | Quên mật khẩu | Migration thêm cột reset token, `forgot-password`, `reset-password` | 09 | #2, #5 | — |
| 11 | Kiểm chứng + tài liệu API | Test luồng đầu-cuối, README API, nghiệm thu #1–#5 | 06–10 | Nghiệm thu | — |

Vì sao thứ tự này: 07 trước 08 vì cần có user được tạo qua API để đăng nhập; 08 trước 09 vì
route bảo vệ cần token thật; 10 để cuối vì là unit duy nhất đổi schema DB, tách khỏi các
unit chỉ viết API (một ranh giới mỗi unit).

Các gói phụ thuộc đã kiểm tra tương thích: Fastify 5.12, fastify-plugin 6, @fastify/jwt 10.2,
Joi 18.2 (Node >= 20). Đã chạy thử prototype Fastify + Joi validator + @fastify/jwt.

## Quy trình mỗi unit

1. Đọc spec của unit (đã có sẵn). Nếu thấy mơ hồ, sửa spec trước, không đoán.
2. Agent đọc `AGENTS.md`, các file context và spec, cập nhật `progress-tracker.md`.
3. Agent làm đúng phạm vi spec, không làm thêm.
4. Kiểm chứng theo mục "Verify when done"; xem diff; `npm run check`.
5. Đóng unit: đánh dấu hoàn thành trong `progress-tracker.md`, commit trên nhánh
   `feat/NN-ten-unit`, mở Pull Request vào `main`.
