import type { FastifyError, FastifyPluginAsync } from "fastify";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./authService";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./authSchemas";
import toPublicUser from "../users/toPublicUser";
import getEnv from "../../config/getEnv";
import sendPasswordResetEmail from "../../lib/sendPasswordResetEmail";

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

  app.post(
    "/auth/forgot-password",
    { schema: { body: forgotPasswordSchema } },
    async (request, reply) => {
      const { email } = request.body as { email: string };
      const result = await requestPasswordReset(app.prisma, email, getEnv().resetTokenTtlMinutes);

      if (result) {
        sendPasswordResetEmail(app.log, result.user.email, result.token);
      }

      return reply.status(202).send({
        message: "If the email exists, a reset link has been sent.",
      });
    },
  );

  app.post(
    "/auth/reset-password",
    { schema: { body: resetPasswordSchema } },
    async (request, reply) => {
      const { token, password } = request.body as { token: string; password: string };
      const wasReset = await resetPassword(app.prisma, { token, password });

      if (!wasReset) {
        const error = new Error("Invalid or expired token") as FastifyError;
        error.statusCode = 400;
        throw error;
      }

      return reply.status(200).send({ message: "Password has been reset." });
    },
  );
};

export default authRoutes;
