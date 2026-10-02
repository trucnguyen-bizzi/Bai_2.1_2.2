import type { FastifyError, FastifyPluginAsync } from "fastify";
import requireRole from "../../hooks/requireRole";
import toPublicUser from "./toPublicUser";

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await app.prisma.user.findUnique({ where: { id: request.user.sub } });

    if (!user) {
      const error = new Error("Unauthorized") as FastifyError;
      error.statusCode = 401;
      throw error;
    }

    return reply.send({ user: toPublicUser(user) });
  });

  app.get(
    "/users",
    { preHandler: [app.authenticate, requireRole("admin")] },
    async (request, reply) => {
      const users = await app.prisma.user.findMany({ orderBy: { createdAt: "asc" } });

      return reply.send({ users: users.map(toPublicUser) });
    },
  );
};

export default userRoutes;
