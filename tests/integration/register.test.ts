import prisma from "../../src/lib/prisma";
import buildApp from "../../src/buildApp";

const emailPrefix = "it-";
const app = buildApp({ logger: false });

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
}

describe("POST /auth/register (needs a migrated PostgreSQL)", () => {
  beforeEach(cleanUp);

  afterAll(async () => {
    await cleanUp();
    await app.close();
  });

  it("creates a user with a hashed password and no passwordHash in the response", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "it-register@example.com",
        username: "it_register",
        password: "Register@123",
      },
    });
    const user = await prisma.user.findUnique({ where: { email: "it-register@example.com" } });
    const responseUser = response.json().user;

    expect(response.statusCode).toBe(201);
    expect(responseUser).not.toHaveProperty("passwordHash");
    expect(user?.passwordHash.startsWith("$2")).toBe(true);
    expect(user?.passwordHash).not.toBe("Register@123");
    expect(user?.role).toBe("user");
  });

  it("rejects a client-selected role without creating a user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "it-role@example.com",
        username: "it_role",
        password: "Register@123",
        role: "admin",
      },
    });
    const user = await prisma.user.findUnique({ where: { email: "it-role@example.com" } });

    expect(response.statusCode).toBe(400);
    expect(user).toBeNull();
  });

  it("returns the same conflict message for a duplicate email", async () => {
    await prisma.user.create({
      data: {
        email: "it-duplicate@example.com",
        username: "it_duplicate_email",
        passwordHash: "existing-hash",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "it-duplicate@example.com",
        username: "it_duplicate_new",
        password: "Register@123",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      statusCode: 409,
      error: "Conflict",
      message: "Email or username already in use",
    });
  });

  it("returns a conflict for a duplicate username", async () => {
    await prisma.user.create({
      data: {
        email: "it-name-existing@example.com",
        username: "it_duplicate_name",
        passwordHash: "existing-hash",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "it-name-new@example.com",
        username: "it_duplicate_name",
        password: "Register@123",
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("normalizes the email to lowercase", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "IT-UPPER@example.com",
        username: "it_upper_email",
        password: "Register@123",
      },
    });
    const user = await prisma.user.findUnique({ where: { email: "it-upper@example.com" } });

    expect(response.statusCode).toBe(201);
    expect(user?.email).toBe("it-upper@example.com");
  });

  it("returns field details when the payload is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "it-invalid@example.com",
        username: "it_invalid",
        password: "1234567",
      },
    });
    const responseBody = response.json();

    expect(response.statusCode).toBe(400);
    expect(responseBody).toMatchObject({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
    });
    expect(responseBody.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "password" })]),
    );
  });
});
