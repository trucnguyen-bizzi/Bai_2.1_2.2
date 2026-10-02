import { Prisma, Role, type PrismaClient, type User } from "@prisma/client";
import hashPassword from "../../lib/hashPassword";
import verifyPassword from "../../lib/verifyPassword";
import { generateResetToken, hashResetToken } from "./resetToken";

const dummyPasswordHash = hashPassword("fixed-dummy-password-for-timing");

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

function createConflictError(): Error & { statusCode: number } {
  const error = new Error("Email or username already in use") as Error & { statusCode: number };
  error.statusCode = 409;

  return error;
}

export async function registerUser(prisma: PrismaClient, input: RegisterInput): Promise<User> {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { id: true },
  });

  if (existingUser) {
    throw createConflictError();
  }

  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        role: Role.user,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw createConflictError();
    }

    throw error;
  }
}

interface LoginInput {
  username: string;
  password: string;
}

export async function loginUser(prisma: PrismaClient, input: LoginInput): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { username: input.username } });

  if (!user) {
    await verifyPassword(input.password, await dummyPasswordHash);
    return null;
  }

  const passwordIsValid = await verifyPassword(input.password, user.passwordHash);

  return passwordIsValid ? user : null;
}

export async function requestPasswordReset(
  prisma: PrismaClient,
  email: string,
  ttlMinutes: number,
  now = new Date(),
): Promise<{ user: User; token: string } | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const token = generateResetToken();
  const resetTokenHash = hashResetToken(token);
  const resetTokenExpiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash, resetTokenExpiresAt },
  });

  return { user: updatedUser, token };
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function resetPassword(
  prisma: PrismaClient,
  input: ResetPasswordInput,
  now = new Date(),
): Promise<boolean> {
  const resetTokenHash = hashResetToken(input.token);
  const user = await prisma.user.findFirst({
    where: { resetTokenHash, resetTokenExpiresAt: { gt: now } },
    select: { id: true },
  });

  if (!user) {
    return false;
  }

  const passwordHash = await hashPassword(input.password);
  const result = await prisma.user.updateMany({
    where: { id: user.id, resetTokenHash },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  return result.count === 1;
}
