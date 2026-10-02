import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Một PrismaClient dùng chung cho toàn ứng dụng (dùng lại ở bài 2.2)
const prisma = new PrismaClient();

// 10.6: module chỉ có một export thì dùng default export; tên file khớp tên export (23.6)
export default prisma;
