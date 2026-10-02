import bcrypt from "bcrypt";

// So khớp mật khẩu người dùng nhập với hash đã lưu.
export default async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
