import { generateResetToken, hashResetToken } from "../../src/modules/auth/resetToken";

describe("reset tokens", () => {
  it("generates a 64-character hexadecimal token", () => {
    expect(generateResetToken()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates a different token each time", () => {
    expect(generateResetToken()).not.toBe(generateResetToken());
  });

  it("hashes a token deterministically without returning it", () => {
    const token = generateResetToken();
    const tokenHash = hashResetToken(token);

    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenHash).not.toBe(token);
    expect(hashResetToken(token)).toBe(tokenHash);
  });
});
