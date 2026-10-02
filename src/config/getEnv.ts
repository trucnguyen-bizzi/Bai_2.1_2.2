interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  port: number;
  host: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

const exampleJwtSecret = "replace-this-example-secret-with-a-random-48-byte-value";

function getEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  const nodeEnv = env.NODE_ENV ?? "development";
  const portValue = env.PORT ?? "3000";
  const host = env.HOST ?? "127.0.0.1";
  const jwtSecret = env.JWT_SECRET;
  const jwtExpiresIn = env.JWT_EXPIRES_IN ?? "15m";
  const port = Number(portValue);

  if (nodeEnv !== "development" && nodeEnv !== "test" && nodeEnv !== "production") {
    throw new Error("NODE_ENV must be development, test, or production.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  if (jwtSecret === undefined || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET is required and must be at least 32 characters.");
  }

  if (nodeEnv === "production" && jwtSecret === exampleJwtSecret) {
    throw new Error("JWT_SECRET must not use the example value in production.");
  }

  return { nodeEnv, port, host, jwtSecret, jwtExpiresIn };
}

export default getEnv;
