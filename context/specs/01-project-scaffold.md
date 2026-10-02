# Unit 01: Project scaffold

## Goal

Có project Node.js (>= 20) + TypeScript strict, với ESLint và Prettier cấu hình theo
coding standard của team, để `npm run lint` chạy được trước khi có code ứng dụng.

## Design

Không có giao diện. Cấu trúc thư mục gốc: `src/`, `prisma/`, `scripts/`, `tests/`,
`context/`. Quy tắc code theo `context/code-standards.md`.

## Implementation

### package.json
- `private: true`, `engines.node >= 20`.
- Scripts: `lint`, `lint:fix`, `format`, `typecheck`, `check`.

### TypeScript
- `tsconfig.json`: `strict: true`, `module: CommonJS`, `esModuleInterop`, `target: ES2022`,
  `include`: `src`, `prisma/seed.ts`, `scripts`, `tests`.
- Ghim TypeScript 5 (không dùng bản major mới hơn khi chưa kiểm chứng cấu hình).

### Lint và format (ép coding standard của team)
- `.prettierrc.json`: nháy kép, có chấm phẩy, 2 dấu cách, `printWidth` 100, `trailingComma: all`.
- `eslint.config.mjs`: mỗi rule có comment số mục của tài liệu team (cấm `var`, `++`,
  `for..of`, wildcard import...).
- `.editorconfig`, `.prettierignore`.

### Môi trường
- `.gitignore` (có `.env`, `node_modules`, `dist`), `.env.example`.

## Dependencies

- `typescript@5`, `tsx`, `@types/node@22` (ngôn ngữ và chạy script)
- `eslint@9`, `@eslint/js@9`, `typescript-eslint`, `eslint-config-prettier`, `prettier` (chuẩn code)
- `dotenv` (nạp `.env`)

## Verify when done

- [ ] `npm install` thành công
- [ ] `npx tsc --noEmit` không lỗi
- [ ] `npm run lint` không lỗi
- [ ] Viết thử một file vi phạm (`var`, `for..of`) thì ESLint báo lỗi
- [ ] `.env` không bị git theo dõi (`git check-ignore .env`)
