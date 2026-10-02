# Build Plan — Auth Training Server

Kế hoạch thứ tự các unit cho toàn bộ Ngày 2. Mỗi unit là một việc nhỏ, có kết quả kiểm
chứng được và nằm trong một ranh giới hệ thống. Mỗi unit có file spec riêng
(`NN-ten-unit.md`) gồm Goal, Design, Implementation, Dependencies, Verify when done.

## Quy tắc xếp thứ tự

- **Phụ thuộc đi trước:** unit cần cái gì thì cái đó phải có ở unit trước.
- **Hạ tầng và dữ liệu trước code ứng dụng:** Docker → schema/migration → seed → test.
- **Cài dependency đúng lúc:** chỉ cài gói ở unit mà nó bắt đầu được dùng thật.
- **Một unit, một ranh giới:** không trộn hạ tầng (Docker) với schema, hay schema với API.
- **Bảo mật trước chức năng:** admin và hash mật khẩu có trước API đăng nhập (bài 2.2).

## Bài 2.1 — Database (spec đã viết)

| Unit | Tên | Xây gì | Phụ thuộc | Yêu cầu của bài | Trạng thái |
|---|---|---|---|---|---|
| 01 | Project scaffold | Node.js + TypeScript strict, ESLint/Prettier theo coding standard team | — | #1 | Đã dựng, chờ kiểm chứng |
| 02 | Postgres bằng Docker Compose | `docker-compose.yml` có healthcheck, scripts `db:up/down/reset` | 01 | #3 | Đã dựng, chờ kiểm chứng |
| 03 | Prisma schema và migration | Model `User`, enum `Role`, migration `init_users` | 01, 02 | #2, #4 (bảng), #5 | Đã dựng, chờ kiểm chứng |
| 04 | Seed admin | Hash mật khẩu, đọc cấu hình admin, `seedAdmin`, `prisma/seed.ts` | 03 | #4 (seed) | Đã dựng, chờ kiểm chứng |
| 05 | Kiểm chứng tự động | Unit test, integration test, `verify-db.ts` | 01–04 | Nghiệm thu #1–#5 | Unit test PASS; integration chờ Postgres |

Hai unit 02 và 03 không gộp được vì khác ranh giới (hạ tầng và schema) và mỗi unit có kết
quả kiểm chứng riêng (container healthy; bảng tồn tại trong DB).

## Bài 2.2 — Auth Server (kế hoạch, CHƯA viết spec)

Chỉ phác thảo để thấy thứ tự. Viết spec chi tiết ngay trước khi làm từng unit, và chỉ cài
Fastify, JWT, Joi ở unit đầu tiên cần đến chúng.

| Unit | Tên | Dự kiến |
|---|---|---|
| 06 | Fastify skeleton | Server, plugin Prisma, route `GET /health`, error handler |
| 07 | Register | `POST /auth/register`, validate bằng Joi, hash mật khẩu, role luôn là `user` |
| 08 | Login và JWT | `POST /auth/login`, ký JWT, response không chứa hash |
| 09 | Route được bảo vệ | Decorator `authenticate`, `GET /me`, kiểm tra role |
| 10 | Quên mật khẩu | Migration thêm cột reset token (lưu hash, có hạn), `forgot-password` và `reset-password` |

## Quy trình mỗi unit

1. Viết hoặc cập nhật spec của unit.
2. Agent đọc `AGENTS.md`, các file context và spec, rồi cập nhật `progress-tracker.md`.
3. Agent làm đúng phạm vi spec, không làm thêm.
4. Kiểm tra theo mục "Verify when done"; xem diff.
5. Đóng unit: đánh dấu hoàn thành trong `progress-tracker.md`.
