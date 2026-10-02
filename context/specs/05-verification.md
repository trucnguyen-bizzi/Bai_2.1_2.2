# Unit 05: Kiểm chứng tự động

## Goal

Có test chạy lặp lại được và một script nghiệm thu, chứng minh cả 5 yêu cầu của bài 2.1
đã đạt. Unit này không thêm tính năng mới.

## Design

Hai tầng test, tách bạch:
- **Unit test** (`tests/unit/`): hàm thuần, không đụng DB, mạng.
- **Integration test** (`tests/integration/`): chạm Postgres thật, chạy `--runInBand`,
  dữ liệu test dùng email tiền tố `it-` và tự dọn.

## Implementation

### Unit test
- `password.test.ts`: hash khác bản gốc, có salt ngẫu nhiên, từ chối rỗng, verify đúng/sai.
- `getAdminSeedConfig.test.ts`: giá trị mặc định, đọc env và trim, từ chối email/username/
  mật khẩu không hợp lệ.

### Integration test
- `users.db.test.ts`: role mặc định `user`; từ chối email trùng, username trùng, role
  `superadmin`; `seedAdmin` lưu bcrypt hash và idempotent (không tạo trùng, không ghi đè).

### scripts/verify-db.ts
- Script nghiệm thu in PASS/FAIL cho: kết nối, bảng `users`, enum `Role`, đúng một admin,
  mật khẩu đã hash và khớp `.env`, DB từ chối role sai, role mặc định, email unique.
  Exit code 0 nếu đạt tất cả.

### Scripts
- `test`, `test:integration`, `db:verify`, `check` (= lint + typecheck + test), `setup`.

## Dependencies

- `jest@29`, `ts-jest@29`, `@types/jest@29` (dev)

## Verify when done

- [ ] `npm test`: tất cả unit test PASS
- [ ] `npm run test:integration` PASS trên Postgres đã migrate
- [ ] `npm run db:verify` in `TẤT CẢ ĐẠT`
- [ ] `npm run check` không lỗi
- [ ] `npm run setup` chạy trọn từ máy sạch (có Docker): generate → up → deploy → seed → verify
- [ ] Tick đủ checklist trong `context/progress-tracker.md`
