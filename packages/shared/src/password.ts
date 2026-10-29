const MIN_LENGTH = 8;
const MAX_BYTES = 72;

const byteLength = (value: string) => new TextEncoder().encode(value).length;

export const validatePassword = (password: unknown): string | null => {
  if (typeof password !== "string" || password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters long`;
  }
  if (byteLength(password) > MAX_BYTES) {
    return `Password must be at most ${MAX_BYTES} bytes long`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one digit";
  }
  return null;
};
