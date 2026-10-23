import { validatePassword } from "@rbac/shared";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const generateTemporaryPassword = (length = 14): string => {
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint32Array(length));
    const candidate = Array.from(
      bytes,
      (n) => ALPHABET[n % ALPHABET.length],
    ).join("");
    if (validatePassword(candidate) === null) return candidate;
  }
};
