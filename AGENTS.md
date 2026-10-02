# AGENTS.md — Auth Training (Bài tập 2.1: Postgres + Prisma)

Bạn là coding agent làm việc trong project này. Làm theo các file context,
không tự suy diễn hành vi.

## Đọc trước khi làm (theo thứ tự)

1. `context/project-overview.md` — mục tiêu và phạm vi
2. `context/architecture.md` — stack, ranh giới, invariants
3. `context/ui-context.md` — N/A (backend)
4. `context/code-standards.md` — quy tắc code
5. `context/ai-workflow-rules.md` — cách làm từng bước nhỏ
6. `context/progress-tracker.md` — tiến độ, cập nhật sau mỗi thay đổi

## Specs và quy trình theo unit

Công việc được chia thành các unit, kế hoạch ở `context/specs/00-build-plan.md`, mỗi unit có
spec `context/specs/NN-*.md` (Goal, Design, Implementation, Dependencies, Verify when done).
Chỉ làm đúng phạm vi của unit đang được giao, không làm thêm.

Dùng ba prompt sau cho mỗi unit:

1. **Làm unit:**
   `Read context/specs/NN-ten-unit.md. Update context/progress-tracker.md to mark this as in progress. Implement it exactly as specified. Do not go beyond the scope of this unit.`
2. **Sửa lệch spec:**
   `The [thành phần] does not match the spec. Expected: [spec nói gì]. Current: [đang làm gì]. Fix only this. Do not change anything else.`
3. **Đóng unit:**
   `Implementation is complete and verified. Mark unit NN complete in context/progress-tracker.md.`

Nếu agent đi chệch: sửa spec hoặc `progress-tracker.md` cho đúng rồi mới làm lại, không vá code ngoài phạm vi.

## Trạng thái project

Project đã được dựng sẵn đầy đủ cho Bài 2.1 (Unit 01–05): Docker Compose, Prisma schema,
migration `init_users`, seed admin, test, script kiểm tra. Việc của bạn là **chạy, kiểm tra
theo mục "Verify when done" của từng spec và sửa nếu có lỗi**, không viết lại từ đầu.

## Lệnh chạy

```bash
npm install                # cài dependency
cp .env.example .env       # nếu chưa có .env
npm run setup              # generate -> docker up -> migrate deploy -> seed -> verify
```

Từng bước riêng:

| Lệnh | Tác dụng |
|---|---|
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:up` | Chạy Postgres bằng Docker Compose (chờ healthcheck) |
| `npm run db:deploy` | Áp migration có sẵn |
| `npm run db:migrate` | Tạo migration mới khi sửa schema (chỉ dùng khi dev) |
| `npm run db:seed` | Seed admin (idempotent) |
| `npm run db:verify` | Kiểm tra tự động yêu cầu 2.1, exit 0 nếu đạt |
| `npm run db:studio` | Xem dữ liệu |
| `npm run dev` | Chạy Fastify server ở chế độ watch |
| `npm start` | Chạy Fastify server |
| `npm run typecheck` | Generate + `tsc --noEmit` |
| `npm run lint` | ESLint + Prettier check theo coding standard của team |
| `npm run lint:fix` | Tự sửa lỗi lint và format |
| `npm test` | Unit test (Jest), không cần DB |
| `npm run test:integration` | Integration test với Postgres thật (cần `db:up` + `db:deploy`) |
| `npm run check` | `lint` + `typecheck` + `test` (chạy trước khi báo xong) |
| `npm run db:reset` | Xoá container + volume (mất dữ liệu) |

## Định nghĩa hoàn thành (Definition of Done)

- `npm run check` không lỗi (lint + typecheck + unit test)
- `npm run test:integration` đạt khi Postgres đang chạy và đã migrate
- `npm run setup` chạy hết, `npm run db:verify` in "TẤT CẢ ĐẠT"
- Chạy `npm run db:seed` lần 2 không lỗi, không tạo thêm admin
- `.env` không nằm trong git
- `context/progress-tracker.md` đã tick checklist và ghi chú kết quả

## Quy tắc bắt buộc

- Không sửa tay migration đã có trong `prisma/migrations/`; cần đổi schema thì
  `npm run db:migrate -- --name <ten_migration>` để tạo migration mới.
- Không lưu mật khẩu plain text; chỉ bcrypt hash.
- Không commit `.env`, không hard-code secret.
- Giữ nguyên Prisma 6 (`prisma@6`, `@prisma/client@6`). Không nâng lên Prisma 7
  nếu không được yêu cầu (cách cấu hình khác nhau).
- Cảnh báo `package.json#prisma is deprecated` của Prisma 6 là bình thường, bỏ qua.
- Không làm phần ngoài phạm vi (API, JWT, GraphQL) khi chưa được yêu cầu.

## Coding standard của team (bắt buộc)

Chi tiết ở `context/code-standards.md`. Tóm tắt các điểm hay bị vi phạm:

- Dấu nháy **kép** `"..."`, có chấm phẩy, thụt lề 2 dấu cách, dòng tối đa 100 ký tự, có dấu phẩy cuối.
- `const` mặc định, cấm `var`; cấm `++`/`--`; cấm `for..in` và `for..of` (dùng map/filter/forEach...).
- Không wildcard import (`import * as`); module chỉ có một export thì dùng `export default`.
- Không mutate/gán lại tham số; không dấu gạch dưới đầu/cuối tên; tên biến ≥ 2 ký tự.
- Luôn `===`; không ternary lồng nhau; destructuring cho object và mảng.
- Chạy `npm run lint:fix` rồi `npm run check` sau mỗi thay đổi code.

## Test

- Logic mới phải có test đi kèm: hàm thuần thì viết unit test trong `tests/unit/`, phần chạm DB thì viết integration test trong `tests/integration/`. Đặt tên `<tên>.test.ts`.
- Test không được đụng vào admin thật: dữ liệu test dùng email có tiền tố `it-` và phải tự dọn sau khi chạy.
- Không sửa test cho pass; nếu test fail thì sửa code hoặc giải thích vì sao test sai.

## Lưu ý môi trường

- Cần Docker đang chạy. Nếu sandbox không có Docker (ví dụ một số môi trường
  Codex cloud), hãy chạy trên máy local (Codex CLI / IDE) hoặc cung cấp
  `DATABASE_URL` trỏ tới một Postgres khác rồi bỏ qua `db:up`.
- Cần truy cập mạng để Prisma tải engine (`binaries.prisma.sh`) khi `prisma generate`.
- Cổng host 5432 bị chiếm (thường gặp trên Windows): đặt `POSTGRES_PORT=5433` và
  đổi port trong `DATABASE_URL` thành `5433` trong `.env`. Container vẫn dùng port 5432.
