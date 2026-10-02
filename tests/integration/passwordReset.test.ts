import prisma from "../../src/lib/prisma";
import hashPassword from "../../src/lib/hashPassword";
import verifyPassword from "../../src/lib/verifyPassword";
import buildApp from "../../src/buildApp";
import { hashResetToken } from "../../src/modules/auth/resetToken";

const testEmail = "it-password-reset@example.com";
const testUsername = "it_password_reset";
const oldPassword = "Old@Password123";
const newPassword = "New@Password123";
const app = buildApp({ logger: false });

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: testEmail } });
}

function getLoggedResetToken(logSpy: jest.SpyInstance): string {
  const tokenLogCall = logSpy.mock.calls.find(([, message]) => message === "Password reset token");
  const logData = tokenLogCall?.[0] as { token?: unknown } | undefined;

  expect(logData?.token).toEqual(expect.any(String));

  return logData?.token as string;
}

async function createTestUser(): Promise<void> {
  await cleanUp();
  await prisma.user.create({
    data: {
      email: testEmail,
      username: testUsername,
      passwordHash: await hashPassword(oldPassword),
    },
  });
}

describe("password reset routes (needs a migrated PostgreSQL)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await createTestUser();
  });

  afterAll(async () => {
    await cleanUp();
    await app.close();
  });

  it("returns the same generic response for existing and unknown emails", async () => {
    const existingResponse = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const unknownResponse = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "it-unknown@example.com" },
    });

    expect(existingResponse.statusCode).toBe(202);
    expect(existingResponse.body).toBe(unknownResponse.body);
    expect(existingResponse.body).not.toContain("token");
  });

  it("stores only the token hash and accepts a token once", async () => {
    const logSpy = jest.spyOn(app.log, "info");
    const response = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const token = getLoggedResetToken(logSpy);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });

    expect(response.statusCode).toBe(202);
    expect(response.body).not.toContain(token);
    expect(user.resetTokenHash).toBe(hashResetToken(token));
    expect(user.resetTokenHash).not.toBe(token);

    const resetResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, password: newPassword },
    });
    const reusedResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, password: newPassword },
    });
    const updatedUser = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });

    expect(resetResponse.statusCode).toBe(200);
    expect(reusedResponse.statusCode).toBe(400);
    expect(updatedUser.resetTokenHash).toBeNull();
    expect(updatedUser.resetTokenExpiresAt).toBeNull();
    expect(await verifyPassword(oldPassword, updatedUser.passwordHash)).toBe(false);
    expect(await verifyPassword(newPassword, updatedUser.passwordHash)).toBe(true);
    logSpy.mockRestore();
  });

  it("rejects expired and unknown tokens with the same response", async () => {
    const token = "a".repeat(64);
    await prisma.user.update({
      where: { email: testEmail },
      data: {
        resetTokenHash: hashResetToken(token),
        resetTokenExpiresAt: new Date(Date.now() - 1000),
      },
    });
    const expiredResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, password: newPassword },
    });
    const unknownResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token: "b".repeat(64), password: newPassword },
    });

    expect(expiredResponse.statusCode).toBe(400);
    expect(expiredResponse.body).toBe(unknownResponse.body);
    expect(expiredResponse.json()).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid or expired token",
    });
  });

  it("keeps a token usable after password validation fails", async () => {
    const logSpy = jest.spyOn(app.log, "info");
    await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const token = getLoggedResetToken(logSpy);
    const invalidResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, password: "short" },
    });
    const validResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token, password: newPassword },
    });

    expect(invalidResponse.statusCode).toBe(400);
    expect(validResponse.statusCode).toBe(200);
    logSpy.mockRestore();
  });

  it("invalidates an older token when a new reset is requested", async () => {
    const logSpy = jest.spyOn(app.log, "info");
    await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const firstToken = getLoggedResetToken(logSpy);
    await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const oldTokenResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token: firstToken, password: newPassword },
    });

    expect(oldTokenResponse.statusCode).toBe(400);
    logSpy.mockRestore();
  });
});
