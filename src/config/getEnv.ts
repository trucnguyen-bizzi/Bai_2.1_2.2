interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  port: number;
  host: string;
}

function getEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = env.NODE_ENV ?? "development";
  const portValue = env.PORT ?? "3000";
  const host = env.HOST ?? "127.0.0.1";
  const port = Number(portValue);

  if (nodeEnv !== "development" && nodeEnv !== "test" && nodeEnv !== "production") {
    throw new Error("NODE_ENV must be development, test, or production.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return { nodeEnv, port, host };
}

export default getEnv;
