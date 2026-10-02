import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import prisma from "../../src/lib/prisma";
import hashPassword from "../../src/lib/hashPassword";
import buildApp from "../../src/buildApp";

const testEmail = "it-login@example.com";
const testUsername = "it_login_user";
const testPassword = "Login@Password123";
const app = buildApp({ logger: false });

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: testEmail } });
}

describe("POST /auth/login (needs a migrated PostgreSQL)", () => {
  beforeEach(async () => {
    await cleanUp();
    await prisma.user.create({
      data: {
        email: testEmail,
        username: testUsername,
        passwordHash: await hashPassword(testPassword),
      },
    });
  });

  afterAll(async () => {
    await cleanUp();
    await app.close();
  });

  it("returns a JWT with only the user id and role", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: testPassword },
    });
    const responseBody = response.json();
    const tokenPayload = app.jwt.verify<{
      sub: string;
      role: string;
      iat: number;
      exp: number;
      email?: string;
      passwordHash?: string;
    }>(responseBody.accessToken);

    expect(response.statusCode).toBe(200);
    expect(responseBody).toMatchObject({ tokenType: "Bearer", expiresIn: 900 });
    expect(tokenPayload).toMatchObject({ role: "user" });
    expect(tokenPayload.sub).toBeTruthy();
    expect(tokenPayload.exp - tokenPayload.iat).toBe(900);
    expect(tokenPayload).not.toHaveProperty("email");
    expect(tokenPayload).not.toHaveProperty("passwordHash");
  });

  it("returns the same unauthorized response for a wrong password and username", async () => {
    const wrongPasswordResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: "Wrong@Password123" },
    });
    const unknownUsernameResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: "it_unknown_user", password: testPassword },
    });
    const expectedResponse = {
      statusCode: 401,
      error: "Unauthorized",
      message: "Invalid username or password",
    };

    expect(wrongPasswordResponse.statusCode).toBe(401);
    expect(unknownUsernameResponse.statusCode).toBe(401);
    expect(wrongPasswordResponse.json()).toEqual(expectedResponse);
    expect(unknownUsernameResponse.json()).toEqual(expectedResponse);
  });

  it("rejects a payload missing required fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
    });
  });

  it("rejects a JWT signed with a different secret", async () => {
    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: testPassword },
    });
    const verifier = fastify({ logger: false });

    await verifier.register(fastifyJwt, {
      secret: "different-test-secret-which-is-long-enough-123456",
      verify: { algorithms: ["HS256"] },
    });
    await verifier.ready();

    expect(() => verifier.jwt.verify(loginResponse.json().accessToken)).toThrow();

    await verifier.close();
  });
});
