import { describe, expect, it } from "vitest";
import { toPhoneDigits, userFormSchema } from "../users/userFormSchema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  role: "Employee",
  department: "IT",
  phone: "",
  location: "London",
  status: "Active" as const,
  password: "",
};

const messagesFor = (values: object) => {
  const result = userFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe("userFormSchema", () => {
  it("accepts a valid user with a generated password", () => {
    expect(messagesFor(valid)).toEqual([]);
  });

  it("shows the form's required-field messages", () => {
    expect(
      messagesFor({
        ...valid,
        name: "",
        email: "",
        department: "",
        location: "",
      }),
    ).toEqual(
      expect.arrayContaining([
        "Name is required",
        "Email is required",
        "Department is required",
        "Location is required",
      ]),
    );
  });

  it("rejects a malformed email", () => {
    expect(messagesFor({ ...valid, email: "nope" })).toEqual([
      "Please enter a valid email address",
    ]);
  });

  it("applies the api's password policy to a typed password", () => {
    expect(messagesFor({ ...valid, password: "short1" })).toEqual([
      "Password must be at least 8 characters long",
    ]);
    expect(messagesFor({ ...valid, password: "password1" })).toEqual([]);
  });

  it("requires nine phone digits when a phone is given", () => {
    expect(messagesFor({ ...valid, phone: "1234" })).toEqual([
      "Phone number must be exactly 9 digits",
    ]);
  });
});

describe("toPhoneDigits", () => {
  it("keeps at most nine digits", () => {
    expect(toPhoneDigits("+48 123-456-789 0")).toBe("481234567");
  });
});
