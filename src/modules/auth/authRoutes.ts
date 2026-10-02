import type { FastifyPluginAsync } from "fastify";
import { registerUser } from "./authService";
import { registerSchema } from "./authSchemas";
import toPublicUser from "../users/toPublicUser";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", { schema: { body: registerSchema } }, async (request, reply) => {
    const { email, username, password } = request.body as {
      email: string;
      username: string;
      password: string;
    };
    const user = await registerUser(app.prisma, { email, username, password });

    return reply.status(201).send({ user: toPublicUser(user) });
  });
};

export default authRoutes;
