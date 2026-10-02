import getAdminSeedConfig from "../../src/config/getAdminSeedConfig";

describe("getAdminSeedConfig", () => {
  it("falls back to default values when the environment is empty", () => {
    expect(getAdminSeedConfig({})).toEqual({
      email: "admin@example.com",
      username: "admin",
      password: "Admin@123456",
    });
  });

  it("reads values from the environment and trims email and username", () => {
    const config = getAdminSeedConfig({
      ADMIN_EMAIL: "  boss@company.vn ",
      ADMIN_USERNAME: " boss ",
      ADMIN_PASSWORD: "S3cret-pass",
    });

    expect(config).toEqual({
      email: "boss@company.vn",
      username: "boss",
      password: "S3cret-pass",
    });
  });

  it("throws when the email is invalid", () => {
    expect(() => getAdminSeedConfig({ ADMIN_EMAIL: "not-an-email" })).toThrow(
      "ADMIN_EMAIL is not a valid email",
    );
  });

  it("throws when the username is too short", () => {
    expect(() => getAdminSeedConfig({ ADMIN_USERNAME: "ab" })).toThrow(
      "ADMIN_USERNAME must be at least 3 characters",
    );
  });

  it("throws when the password is too short", () => {
    expect(() => getAdminSeedConfig({ ADMIN_PASSWORD: "short" })).toThrow(
      "ADMIN_PASSWORD must be at least 8 characters",
    );
  });
});
