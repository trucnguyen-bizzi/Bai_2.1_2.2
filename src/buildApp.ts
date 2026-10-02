import fastify, { type FastifyInstance } from "fastify";
import getEnv from "./config/getEnv";
import errorHandler from "./plugins/errorHandler";
import joiValidator from "./plugins/joiValidator";
import prismaPlugin from "./plugins/prismaPlugin";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./modules/auth/authRoutes";

interface BuildAppOptions {
  logger?: boolean;
}

function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const { nodeEnv } = getEnv();
  const { logger = nodeEnv !== "test" } = options;
  const app = fastify({ logger });

  app.register(errorHandler);
  app.register(joiValidator);
  app.register(prismaPlugin);
  app.register(healthRoutes);
  app.register(authRoutes);

  return app;
}

export default buildApp;
