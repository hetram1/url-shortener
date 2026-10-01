const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const DEFAULT_LENGTH = 6;

export function generateShortCode(
  length: number = DEFAULT_LENGTH,
): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Short code length must be a positive integer");
  }

  let code = "";

  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[index];
  }

  return code;
}
