import fastify, { type FastifyInstance } from "fastify";
import getEnv from "./config/getEnv";
import errorHandler from "./plugins/errorHandler";
import joiValidator from "./plugins/joiValidator";
import jwtPlugin from "./plugins/jwtPlugin";
import prismaPlugin from "./plugins/prismaPlugin";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./modules/auth/authRoutes";
import userRoutes from "./modules/users/userRoutes";

interface BuildAppOptions {
  logger?: boolean;
}

function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const { nodeEnv } = getEnv();
  const { logger = nodeEnv !== "test" } = options;
  const app = fastify({ logger });

  app.register(errorHandler);
  app.register(joiValidator);
  app.register(jwtPlugin);
  app.register(prismaPlugin);
  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(userRoutes);

  return app;
}

export default buildApp;
