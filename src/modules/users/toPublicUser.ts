import type { User } from "@prisma/client";

function toPublicUser(user: User) {
  const { id, email, username, role, createdAt } = user;

  return { id, email, username, role, createdAt };
}

export default toPublicUser;
