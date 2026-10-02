# AI Workflow Rules

## Approach

Xây dựng dự án theo từng bước nhỏ, dựa trên spec (các file trong
`context/`). Context files định nghĩa cái gì cần build, build như thế
nào và tiến độ hiện tại. Luôn làm theo spec, không tự suy diễn hay
bịa hành vi mới. Đây là dự án học tập: AI thực thi, nhưng developer phải
hiểu từng file được tạo ra và có thể giải thích lại.

## Scoping Rules

- Mỗi lần chỉ làm một đơn vị công việc.
- Ưu tiên bước nhỏ, kiểm tra được, thay vì thay đổi lớn mang tính suy đoán.
- Không gộp các phần không liên quan vào một bước.

## Thứ tự các đơn vị công việc cho bài 2.1

1. Khởi tạo project (npm, TypeScript, tsconfig, .gitignore, scripts)
2. Docker Compose + chạy Postgres, kiểm tra kết nối bằng psql
3. Khởi tạo Prisma, cấu hình `.env` / `DATABASE_URL`
4. Viết schema (`Role`, `User`), chạy `prisma validate`
5. Chạy migration, đọc file `migration.sql` và kiểm tra bảng trong DB
6. Viết seed admin, chạy seed, kiểm tra bằng Prisma Studio
7. Kiểm thử ràng buộc (role sai bị từ chối, chạy seed lại không trùng)

## When to Split Work

Tách bước nếu nó gộp:

- Thay đổi hạ tầng (Docker) và thay đổi schema
- Thay đổi schema và code ứng dụng (API)
- Hành vi chưa được định nghĩa rõ trong context files

Nếu một thay đổi không kiểm tra được end-to-end nhanh chóng,
phạm vi đang quá rộng, hãy tách nhỏ.

## Handling Missing Requirements

- Không tự bịa hành vi chưa có trong context files.
- Nếu yêu cầu mơ hồ, làm rõ trong file context liên quan trước khi code.
- Nếu yêu cầu bị thiếu, thêm vào mục Open Questions của
  `progress-tracker.md` rồi mới tiếp tục.

## Protected Files

Không sửa nếu không được yêu cầu rõ ràng:

- `prisma/migrations/*` đã được chạy (tạo migration mới thay vì sửa)
- Thư mục `node_modules/`, `dist/`
- File `.env` thật (chỉ sửa `.env.example` khi thêm biến mới)

## Keeping Docs in Sync

Cập nhật file context liên quan khi thay đổi:

- Kiến trúc hoặc ranh giới hệ thống
- Data model (thêm bảng/cột)
- Quy ước code
- Phạm vi tính năng

## Before Moving to the Next Unit

1. Đơn vị hiện tại chạy được end-to-end trong phạm vi của nó
2. Không vi phạm invariant nào trong `architecture.md`
3. `progress-tracker.md` đã phản ánh công việc vừa xong
4. `npm run check` (ESLint + Prettier + typecheck + unit test) không báo lỗi, theo `context/code-standards.md`
5. Logic mới đã có test; phần chạm DB đã có integration test và `npm run test:integration` đạt
5. Developer giải thích lại được vừa làm gì và vì sao
