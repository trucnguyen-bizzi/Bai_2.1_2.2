import type { FastifyError, FastifyPluginAsync } from "fastify";
import { loginUser, registerUser } from "./authService";
import { loginSchema, registerSchema } from "./authSchemas";
import toPublicUser from "../users/toPublicUser";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/login", { schema: { body: loginSchema } }, async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    const user = await loginUser(app.prisma, { username, password });

    if (!user) {
      const error = new Error("Invalid username or password") as FastifyError;
      error.statusCode = 401;
      throw error;
    }

    const accessToken = app.jwt.sign({ sub: user.id, role: user.role });
    const decodedToken = app.jwt.decode<{ iat: number; exp: number }>(accessToken);

    if (decodedToken === null) {
      throw new Error("Unable to decode signed access token.");
    }

    return reply.send({
      accessToken,
      tokenType: "Bearer",
      expiresIn: decodedToken.exp - decodedToken.iat,
    });
  });

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
