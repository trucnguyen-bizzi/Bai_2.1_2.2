import fastify, { type FastifyInstance } from "fastify";
import getEnv from "./config/getEnv";
import errorHandler from "./plugins/errorHandler";
import prismaPlugin from "./plugins/prismaPlugin";
import healthRoutes from "./routes/healthRoutes";

interface BuildAppOptions {
  logger?: boolean;
}

function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const { nodeEnv } = getEnv();
  const { logger = nodeEnv !== "test" } = options;
  const app = fastify({ logger });

  app.register(errorHandler);
  app.register(prismaPlugin);
  app.register(healthRoutes);

  return app;
}

export default buildApp;
