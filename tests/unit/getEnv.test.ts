import getEnv from "../../src/config/getEnv";

const validJwtSecret = "a".repeat(32);

describe("getEnv", () => {
  it("uses default values", () => {
    expect(getEnv({ JWT_SECRET: validJwtSecret })).toEqual({
      nodeEnv: "development",
      port: 3000,
      host: "127.0.0.1",
      jwtSecret: validJwtSecret,
      jwtExpiresIn: "15m",
    });
  });

  it("reads configured values", () => {
    const env = {
      NODE_ENV: "production",
      PORT: "8080",
      HOST: "0.0.0.0",
      JWT_SECRET: "b".repeat(32),
      JWT_EXPIRES_IN: "30m",
    };

    expect(getEnv(env)).toEqual({
      nodeEnv: "production",
      port: 8080,
      host: "0.0.0.0",
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: "30m",
    });
  });

  it.each(["abc", "0", "70000"])("rejects invalid PORT value %s", (port) => {
    expect(() => getEnv({ PORT: port, JWT_SECRET: validJwtSecret })).toThrow(
      "PORT must be an integer between 1 and 65535.",
    );
  });

  it("rejects invalid NODE_ENV", () => {
    expect(() => getEnv({ NODE_ENV: "staging", JWT_SECRET: validJwtSecret })).toThrow(
      "NODE_ENV must be development, test, or production.",
    );
  });

  it("rejects a missing JWT_SECRET", () => {
    expect(() => getEnv({})).toThrow("JWT_SECRET is required and must be at least 32 characters.");
  });

  it("rejects a short JWT_SECRET", () => {
    expect(() => getEnv({ JWT_SECRET: "short-secret" })).toThrow(
      "JWT_SECRET is required and must be at least 32 characters.",
    );
  });

  it("rejects the example JWT_SECRET in production", () => {
    expect(() =>
      getEnv({
        NODE_ENV: "production",
        JWT_SECRET: "replace-this-example-secret-with-a-random-48-byte-value",
      }),
    ).toThrow("JWT_SECRET must not use the example value in production.");
  });
});
