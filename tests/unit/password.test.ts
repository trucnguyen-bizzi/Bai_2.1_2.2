import hashPassword from "../../src/lib/hashPassword";
import verifyPassword from "../../src/lib/verifyPassword";

describe("hashPassword", () => {
  it("returns a bcrypt hash that is different from the plain password", async () => {
    const plainPassword = "Admin@123456";

    const passwordHash = await hashPassword(plainPassword);

    expect(passwordHash).not.toBe(plainPassword);
    expect(passwordHash.startsWith("$2")).toBe(true);
  });

  it("produces a different hash every time because of the random salt", async () => {
    const first = await hashPassword("Admin@123456");
    const second = await hashPassword("Admin@123456");

    expect(first).not.toBe(second);
  });

  it("rejects an empty password", async () => {
    await expect(hashPassword("")).rejects.toThrow("Password must not be empty");
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const passwordHash = await hashPassword("Admin@123456");

    await expect(verifyPassword("Admin@123456", passwordHash)).resolves.toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const passwordHash = await hashPassword("Admin@123456");

    await expect(verifyPassword("wrong-password", passwordHash)).resolves.toBe(false);
  });
});
