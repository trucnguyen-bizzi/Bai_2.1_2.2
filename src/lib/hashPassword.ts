import bcrypt from "bcrypt";

const saltRounds = 10;

// Hash mật khẩu bằng bcrypt (đã có salt ngẫu nhiên). Không bao giờ lưu mật khẩu plain text.
export default async function hashPassword(plainPassword: string): Promise<string> {
  if (plainPassword.length === 0) {
    throw new Error("Password must not be empty");
  }

  return bcrypt.hash(plainPassword, saltRounds);
}
