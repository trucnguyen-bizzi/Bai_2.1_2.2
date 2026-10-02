import { registerSchema } from "../../src/modules/auth/authSchemas";

describe("registerSchema", () => {
  it("accepts a valid email", () => {
    const { error } = registerSchema.validate({
      email: "person@example.com",
      username: "valid_user",
      password: "password123",
    });

    expect(error).toBeUndefined();
  });

  it("rejects an invalid email", () => {
    const { error } = registerSchema.validate({
      email: "not-an-email",
      username: "valid_user",
      password: "password123",
    });

    expect(error?.details[0]?.path).toEqual(["email"]);
  });

  it("trims and lowercases the email", () => {
    const { value } = registerSchema.validate({
      email: "  Person@Example.COM  ",
      username: "valid_user",
      password: "password123",
    });

    expect(value.email).toBe("person@example.com");
  });

  it.each(["ab", "a".repeat(31), "bad-name"])("rejects invalid username %s", (username) => {
    const { error } = registerSchema.validate({
      email: "person@example.com",
      username,
      password: "password123",
    });

    expect(error?.details[0]?.path).toEqual(["username"]);
  });

  it.each(["short7", "p".repeat(65)])("rejects invalid password %s", (password) => {
    const { error } = registerSchema.validate({
      email: "person@example.com",
      username: "valid_user",
      password,
    });

    expect(error?.details[0]?.path).toEqual(["password"]);
  });

  it("rejects unknown fields", () => {
    const { error } = registerSchema.validate({
      email: "person@example.com",
      username: "valid_user",
      password: "password123",
      role: "admin",
    });

    expect(error?.details[0]?.path).toEqual(["role"]);
  });

  it("rejects missing fields", () => {
    const { error } = registerSchema.validate({}, { abortEarly: false });

    expect(error?.details.map(({ path }) => path[0])).toEqual(["email", "username", "password"]);
  });
});
