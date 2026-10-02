import { Role, type User } from "@prisma/client";
import prisma from "../../src/lib/prisma";
import hashPassword from "../../src/lib/hashPassword";
import buildApp from "../../src/buildApp";

const testEmail = "it-protected@example.com";
const testUsername = "it_protected_user";
const testPassword = "Protected@Password123";
const app = buildApp({ logger: false });

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: testEmail } });
}

async function getTestUser(): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email: testEmail } });

  if (!user) {
    throw new Error("The protected route integration test user was not created.");
  }

  return user;
}

describe("protected user routes (needs a migrated PostgreSQL)", () => {
  beforeAll(async () => {
    await app.ready();
  });

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

  it("returns 401 for /me without a token", async () => {
    const response = await app.inject({ method: "GET", url: "/me" });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      statusCode: 401,
      error: "Unauthorized",
      message: "Unauthorized",
    });
  });

  it("returns 401 for a malformed token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe("Unauthorized");
  });

  it("returns 401 for an expired token", async () => {
    const user = await getTestUser();
    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: "1ms" });

    await new Promise((resolve) => setTimeout(resolve, 25));

    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe("Unauthorized");
  });

  it("returns the authenticated user without sensitive fields", async () => {
    const user = await getTestUser();
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user).toMatchObject({
      id: user.id,
      email: testEmail,
      username: testUsername,
      role: "user",
    });
    expect(response.json().user).not.toHaveProperty("passwordHash");
    expect(response.json().user).not.toHaveProperty("resetTokenHash");
  });

  it("forbids a regular user from listing users", async () => {
    const user = await getTestUser();
    const token = app.jwt.sign({ sub: user.id, role: Role.user });
    const response = await app.inject({
      method: "GET",
      url: "/users",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      statusCode: 403,
      error: "Forbidden",
      message: "Forbidden",
    });
  });

  it("allows admins to list public user data", async () => {
    const admin = await prisma.user.findFirst({ where: { role: Role.admin } });

    if (!admin) {
      throw new Error("The integration test requires the seeded admin user.");
    }

    const token = app.jwt.sign({ sub: admin.id, role: admin.role });
    const response = await app.inject({
      method: "GET",
      url: "/users",
      headers: { authorization: `Bearer ${token}` },
    });
    const responseUsers = response.json().users;

    expect(response.statusCode).toBe(200);
    expect(responseUsers.length).toBeGreaterThan(0);
    responseUsers.forEach((user: Record<string, unknown>) => {
      expect(user).not.toHaveProperty("passwordHash");
      expect(user).not.toHaveProperty("resetTokenHash");
    });
  });

  it("returns 401 when the token user no longer exists", async () => {
    const user = await getTestUser();
    const token = app.jwt.sign({ sub: user.id, role: user.role });

    await prisma.user.delete({ where: { id: user.id } });

    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe("Unauthorized");
  });
});
