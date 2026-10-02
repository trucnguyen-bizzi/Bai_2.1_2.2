# Code Standards

**Nguồn chính:** tài liệu "Coding standard" của team (Bizzi) — file `coding_standard_bizzi.docx`,
bản gốc: https://docs.bizzi.vn/doc/javascript-coding-standard-ugTab8B2Hm.
Tài liệu này là chuẩn JavaScript kiểu Airbnb (23 mục). Dự án dùng TypeScript nên
áp dụng toàn bộ tài liệu, phần bổ sung cho TypeScript/Prisma được ghi rõ ở cuối
(mục "Bổ sung ngoài tài liệu của team").

Số trong ngoặc, ví dụ (6.1), là số mục trong tài liệu gốc.
Khi mâu thuẫn, tài liệu gốc của team được ưu tiên.

## Cách được kiểm tra tự động

- **Prettier** (`.prettierrc.json`, `.editorconfig`): định dạng — dấu nháy, chấm phẩy,
  thụt lề, độ dài dòng, dấu phẩy cuối, khoảng trắng.
- **ESLint** (`eslint.config.mjs`): các rule logic/phong cách, mỗi rule có comment số mục.
- Chạy: `npm run lint`, tự sửa: `npm run lint:fix`, tất cả: `npm run check`.
- Mọi thay đổi code phải qua `npm run check` trước khi coi là xong.

## Định dạng (do Prettier đảm nhiệm)

- Dùng **dấu nháy kép** `"..."` cho chuỗi (6.1). Template string chỉ dùng khi có
  nội suy hoặc xuống dòng (6.1, 6.3).
- **Thụt lề 2 dấu cách**, không dùng tab (19.1).
- Dòng tối đa **100 ký tự**; chuỗi dài được miễn, không cắt chuỗi hay nối bằng `+` (6.2, 19.13).
- **Có dấu chấm phẩy** (21.1).
- **Có dấu phẩy cuối** ở object/array/tham số nhiều dòng; không dùng leading comma (20.1, 20.2, 7.14).
- Khoảng trắng: sau dấu phẩy, quanh toán tử, trong `{ }` có dấu cách, trong `( )` và `[ ]`
  không có (19.2–19.4, 19.10–19.12, 19.15–19.18).
- Kết thúc file bằng đúng một dòng trống; không có khoảng trắng cuối dòng; không có
  nhiều dòng trống liên tiếp (19.5, 19.9, 19.19, 19.20).
- Arrow function luôn có ngoặc quanh tham số: `(x) => x + 1` (8.4).

## Quy tắc code (do ESLint kiểm tra)

| Mục | Quy tắc |
|---|---|
| 2 | Dùng `const`; cần gán lại thì `let`; cấm `var` |
| 3 | Object literal `{}`, shorthand cho property và method, chỉ đặt nháy cho key không hợp lệ, không gọi `hasOwnProperty` trực tiếp, dùng spread thay `Object.assign` |
| 4 | Array literal `[]`, callback của array method phải có `return` |
| 5 | Dùng destructuring cho object và mảng: `const [first] = list;` |
| 6 | Dùng template string thay vì nối chuỗi, cấm `eval` |
| 7 | Không đặt function trong block, không dùng `arguments` (dùng `...rest`), tham số mặc định đặt cuối, **không mutate/gán lại tham số** |
| 8 | Callback ẩn danh dùng arrow function; thân chỉ có một biểu thức trả về thì bỏ `{}` |
| 9 | Dùng `class`, không thao tác `prototype`; method không dùng `this` thì chuyển thành `static` |
| 10 | Dùng `import`/`export`; **cấm wildcard import** (10.2); không export trực tiếp từ import (10.3); mỗi path chỉ import một chỗ (10.4); không export biến `let` (10.5); không ghi đuôi `.js`/`.ts` trong đường dẫn import (10.10) |
| 11 | **Cấm `for..in` và `for..of`**; dùng `map`, `filter`, `reduce`, `forEach`... |
| 12 | Truy cập thuộc tính bằng dấu chấm; dùng `**` thay `Math.pow` |
| 13 | Một khai báo mỗi biến; **cấm `++` / `--`** (dùng `+= 1`); không gán chuỗi (`a = b = c`); không để biến không dùng |
| 15 | Luôn dùng `===` / `!==`; không lồng ternary; không ternary thừa |
| 16 | Block nhiều dòng phải có `{}`; không `else` sau `return` |
| 18 | Chú thích bắt đầu bằng một dấu cách |
| 22 | `parseInt` luôn có radix; không dùng `new String/Number/Boolean` |
| 23 | Tên biến ≥ 2 ký tự; camelCase; PascalCase chỉ cho class; **không dùng dấu gạch dưới đầu/cuối** |

## Quy tắc cần tự giữ (ESLint không bắt hết)

- **Module chỉ có một export thì dùng `export default`** (10.6). Ví dụ `src/lib/prisma.ts`.
- **Tên file khớp tên default export** (23.6): export hàm thì camelCase (23.7), export
  class/object/thư viện thì PascalCase (23.8).
- Đặt toàn bộ `import` ở đầu file, trước mọi câu lệnh khác (10.7).
- Chữ viết tắt viết hoa toàn bộ hoặc thường toàn bộ: `HTTPRequest` hoặc `httpRequest`,
  không viết `HttpRequest` (23.9).
- Chỉ viết HOA hằng số khi nó được export, là `const` và không bao giờ thay đổi (23.10);
  hằng số trong nội bộ file dùng camelCase.
- Không lưu tham chiếu `this` vào biến; dùng arrow function hoặc `bind` (23.5).
- Comment: `/** ... */` cho nhiều dòng (18.1), `//` cho một dòng, đặt trên dòng riêng ngay
  trên đoạn code được chú thích và cách đoạn trước một dòng trống (18.2).
  Dùng `// FIXME:` đánh dấu vấn đề, `// TODO:` đánh dấu việc cần làm (18.4–18.6).
- Điều kiện dài thì mỗi điều kiện một dòng, toán tử logic đặt đầu dòng (17.1).
- Dùng shortcut cho boolean, so sánh tường minh cho string và number (15.3).
- Khai báo biến ở nơi cần dùng, gom `const` trước rồi mới tới `let` (13.3, 13.4).
- Dòng trống sau mỗi block và trước câu lệnh kế tiếp; không đệm dòng trống đầu/cuối block
  (19.7, 19.8).
- Chuỗi method từ 3 lần gọi trở lên thì xuống dòng, dấu chấm đặt đầu dòng (19.6).
- Method chaining: method có thể `return this` (9.3).
- Không dùng generator (11.2).

## Bổ sung ngoài tài liệu của team (cần xác nhận với mentor)

Các mục này **không có trong tài liệu gốc**, do tài liệu chỉ viết cho JavaScript.
Mình bổ sung để phù hợp với TypeScript, Prisma và bảo mật. Nếu team có quy định khác thì sửa lại.

### TypeScript
- `strict: true` bắt buộc. Tránh `any` (ESLint chặn `no-explicit-any`); dùng interface/type
  rõ ràng hoặc `unknown` rồi thu hẹp kiểu.
- Khai báo kiểu trả về cho hàm `async` và hàm public.
- Dữ liệu từ bên ngoài (request body, env) phải được validate trước khi tin tưởng.
- `type`/`interface`/`enum` đặt tên PascalCase.

### Prisma và Database
- Tên bảng và cột trong DB dùng snake_case bằng `@map` / `@@map`; field trong code camelCase.
  (Quy tắc 23.4 chỉ cấm gạch dưới ở đầu/cuối tên, và chỉ áp dụng cho code, nên không xung đột.)
- Dùng `@db.Uuid` cho cột uuid.
- Mỗi thay đổi schema = một migration có tên rõ nghĩa
  (`npm run db:migrate -- --name <ten>`); thư mục `prisma/migrations` phải commit,
  không sửa tay migration đã chạy.
- Chạy `npx prisma validate` và `npx prisma format` trước khi tạo migration.
- Chỉ dùng một `PrismaClient` dùng chung (`src/lib/prisma.ts`).
- Seed dùng `upsert`; luôn gọi `$disconnect()` khi kết thúc script.

### Testing
- Dùng Jest + ts-jest. Unit test ở `tests/unit/`, integration test ở `tests/integration/`, tên file `<tên>.test.ts`.
- Unit test không được chạm DB, mạng hay file hệ thống; chỉ test hàm thuần.
- Integration test chạy `--runInBand`, dùng dữ liệu có tiền tố `it-` và tự dọn trước/sau khi chạy.
- Mỗi test kiểm tra một hành vi; tên test mô tả hành vi mong đợi (`it("rejects a duplicate email")`).
- Logic mới phải kèm test; không sửa test cho pass mà không giải thích.
- Tài liệu của team chưa có mục về test; Jest là công cụ được nêu trong kế hoạch training (Tuần 1, Ngày 4).

### Security
- Hash mật khẩu bằng bcrypt (cost từ 10 trở lên); không lưu plain text.
- Không log mật khẩu, hash hoặc token.
- `.env` nằm trong `.gitignore`; `.env.example` không chứa giá trị thật.

### API Routes (áp dụng cho bài 2.2)
- Validate input bằng Joi trước khi chạy logic; schema Joi được gắn vào route qua `schema: { body: ... }`.
- Từ chối field lạ trong payload (không dùng `stripUnknown`), để client không lén gửi field như `role`.
- Route chỉ nhận request, gọi service và trả response; không đặt logic nghiệp vụ trong route.
- Service nhận `prisma` qua tham số (giống `seedAdmin`) để test được.
- Mỗi route plugin là một default export, tên file trùng tên hàm (`authRoutes.ts`).
- Xác thực (JWT) và phân quyền trước mọi thao tác thay đổi dữ liệu; `authenticate` chạy trước `requireRole`.
- Response lỗi theo một định dạng chung `{ statusCode, error, message, details? }`; dùng mã HTTP đúng (400, 401, 403, 404, 409).
- Lỗi 5xx không lộ stack trace; chi tiết chỉ ghi vào log.
- Không trả `passwordHash` hay trường reset token trong bất kỳ response nào; luôn đi qua `toPublicUser`.
- Lỗi đăng nhập luôn cùng một message; forgot-password luôn trả cùng một response dù email có tồn tại hay không.
- Không đặt secret, token hay mật khẩu vào URL hoặc query string.

## File Organization

- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`
- `src/index.ts` — điểm vào: build app, listen, tắt êm
- `src/buildApp.ts` — dựng FastifyInstance (dùng cho server và test với `app.inject`)
- `src/lib/prisma.ts` — PrismaClient dùng chung (default export)
- `src/lib/hashPassword.ts`, `verifyPassword.ts`, `seedAdmin.ts` — mỗi file một default export, tên file trùng tên hàm (23.6, 23.7)
- `tests/unit/`, `tests/integration/` — test
- `src/modules/<name>/` — route, service, schema Joi theo từng module (`auth`, `users`)
- `src/plugins/` — plugin dùng chung: prisma, errorHandler, joiValidator, jwt
- `src/hooks/` — hook dùng lại (requireRole)
- `src/types/` — khai báo kiểu cho Fastify (`app.prisma`, `app.authenticate`, payload JWT)
- `src/config/` — đọc và kiểm tra biến môi trường (`getEnv`, `getAdminSeedConfig`)
- `scripts/` — script kiểm tra/hỗ trợ (ví dụ `verify-db.ts`)
- Gốc project: `docker-compose.yml`, `.env.example`, `eslint.config.mjs`, `.prettierrc.json`

## Điểm cần hỏi lại mentor

1. Mục 6.1 ghi dùng **dấu nháy kép**, nhưng các ví dụ code trong cùng tài liệu lại dùng
   dấu nháy đơn. Project đang theo văn bản của quy tắc (nháy kép). Nếu team thực tế dùng
   nháy đơn thì đổi `singleQuote` thành `true` trong `.prettierrc.json`.
2. Tài liệu chuẩn cho JavaScript; team có chuẩn riêng cho TypeScript không?
3. Cấm `for..of` (11.1) có áp dụng cả cho code async/await tuần tự không? Hiện ESLint
   đang chặn tất cả `for..of`.
4. Bài 2.2: đăng nhập bằng `username` (theo file kế hoạch) hay bằng `email`? Có cần refresh token không?
   Email có cần chuẩn hoá chữ thường ở cả username không? (Hiện chỉ chuẩn hoá email.)
