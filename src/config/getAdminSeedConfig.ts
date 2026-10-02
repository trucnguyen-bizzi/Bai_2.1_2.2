export interface AdminSeedConfig {
  email: string;
  username: string;
  password: string;
}

const minPasswordLength = 8;
const minUsernameLength = 3;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Đọc và kiểm tra thông tin admin từ biến môi trường (dữ liệu bên ngoài phải được validate).
export default function getAdminSeedConfig(env: NodeJS.ProcessEnv = process.env): AdminSeedConfig {
  const email = (env.ADMIN_EMAIL ?? "admin@example.com").trim();
  const username = (env.ADMIN_USERNAME ?? "admin").trim();
  const password = env.ADMIN_PASSWORD ?? "Admin@123456";

  if (!emailPattern.test(email)) {
    throw new Error(`ADMIN_EMAIL is not a valid email: ${email}`);
  }

  if (username.length < minUsernameLength) {
    throw new Error(`ADMIN_USERNAME must be at least ${minUsernameLength} characters`);
  }

  if (password.length < minPasswordLength) {
    throw new Error(`ADMIN_PASSWORD must be at least ${minPasswordLength} characters`);
  }

  return { email, username, password };
}
