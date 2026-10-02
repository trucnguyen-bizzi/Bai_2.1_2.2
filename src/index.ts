import buildApp from "./buildApp";
import getEnv from "./config/getEnv";

async function startServer(): Promise<void> {
  const { host, port } = getEnv();
  const app = buildApp();

  try {
    await app.listen({ host, port });

    const closeServer = async (): Promise<void> => {
      await app.close();
    };

    process.once("SIGINT", closeServer);
    process.once("SIGTERM", closeServer);
  } catch (error: unknown) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer();
