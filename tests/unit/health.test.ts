import buildApp from "../../src/buildApp";

describe("health routes", () => {
  it("returns the healthy status", async () => {
    const app = buildApp({ logger: false });

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });

    await app.close();
  });

  it("returns the shared not found error format", async () => {
    const app = buildApp({ logger: false });

    const response = await app.inject({ method: "GET", url: "/khong-ton-tai" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      statusCode: 404,
      error: "Not Found",
      message: "Route GET:/khong-ton-tai not found",
    });

    await app.close();
  });
});
