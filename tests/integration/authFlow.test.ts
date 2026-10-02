import prisma from "../../src/lib/prisma";
import buildApp from "../../src/buildApp";
import getEnv from "../../src/config/getEnv";
import { requestPasswordReset } from "../../src/modules/auth/authService";

const testEmail = "it-auth-flow@example.com";
const testUsername = "it_auth_flow";
const oldPassword = "Old@Password123";
const newPassword = "New@Password123";
const app = buildApp({ logger: false });

async function cleanUp(): Promise<void> {
  await prisma.user.deleteMany({
    where: { OR: [{ email: testEmail }, { username: testUsername }] },
  });
}

describe("complete authentication flow (needs a migrated PostgreSQL)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await cleanUp();
  });

  afterAll(async () => {
    await cleanUp();
    await app.close();
  });

  it("registers, authenticates, resets the password, and rejects the old password", async () => {
    const registerResponse = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: testEmail, username: testUsername, password: oldPassword },
    });
    const initialLoginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: oldPassword },
    });
    const accessToken = initialLoginResponse.json().accessToken as string;
    const meResponse = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const forgotResponse = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: testEmail },
    });
    const resetRequest = await requestPasswordReset(
      prisma,
      testEmail,
      getEnv().resetTokenTtlMinutes,
    );

    if (!resetRequest) {
      throw new Error("The auth flow test user was not found for password reset.");
    }

    const resetResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: { token: resetRequest.token, password: newPassword },
    });
    const newPasswordLoginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: newPassword },
    });
    const oldPasswordLoginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { username: testUsername, password: oldPassword },
    });

    expect(registerResponse.statusCode).toBe(201);
    expect(initialLoginResponse.statusCode).toBe(200);
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().user.email).toBe(testEmail);
    expect(forgotResponse.statusCode).toBe(202);
    expect(forgotResponse.json()).toEqual({
      message: "If the email exists, a reset link has been sent.",
    });
    expect(resetResponse.statusCode).toBe(200);
    expect(newPasswordLoginResponse.statusCode).toBe(200);
    expect(oldPasswordLoginResponse.statusCode).toBe(401);
    expect(oldPasswordLoginResponse.json().message).toBe("Invalid username or password");
  });
});
