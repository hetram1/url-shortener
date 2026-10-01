import {
  createUser,
  findUserByEmail,
  UserRecord,
} from "../repositories/userRepository.js";
import { hashPassword } from "./passwordService.js";

export interface RegisterUserInput {
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<UserRecord> {
  const email = input.email.trim().toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  if (!email.includes("@")) {
    throw new Error("Email must be valid");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    return await createUser(email, passwordHash);
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      throw new Error("Email is already registered");
    }

    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return (error as { code?: string }).code === "23505";
  }

  return false;
}
