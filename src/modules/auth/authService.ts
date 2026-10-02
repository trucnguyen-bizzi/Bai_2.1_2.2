import { Prisma, Role, type PrismaClient, type User } from "@prisma/client";
import hashPassword from "../../lib/hashPassword";

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
