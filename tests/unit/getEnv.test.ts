import getEnv from "../../src/config/getEnv";

describe("getEnv", () => {
  it("uses default values", () => {
    expect(getEnv({})).toEqual({
      nodeEnv: "development",
      port: 3000,
      host: "127.0.0.1",
    });
  });

  it("reads configured values", () => {
    expect(getEnv({ NODE_ENV: "production", PORT: "8080", HOST: "0.0.0.0" })).toEqual({
      nodeEnv: "production",
      port: 8080,
      host: "0.0.0.0",
    });
  });

  it.each(["abc", "0", "70000"])("rejects invalid PORT value %s", (port) => {
    expect(() => getEnv({ PORT: port })).toThrow("PORT must be an integer between 1 and 65535.");
  });

  it("rejects invalid NODE_ENV", () => {
    expect(() => getEnv({ NODE_ENV: "staging" })).toThrow(
      "NODE_ENV must be development, test, or production.",
    );
  });
});
