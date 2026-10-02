import { type Role } from "@prisma/client";
import type { preHandlerHookHandler } from "fastify";

function requireRole(...roles: Role[]): preHandlerHookHandler {
  return async (request, reply) => {
    if (!roles.includes(request.user.role)) {
      reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Forbidden",
      });
    }
  };
}

export default requireRole;
