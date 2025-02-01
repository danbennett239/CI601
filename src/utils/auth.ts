import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt.
 * @param password - The plain text password to hash.
 * @returns A hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password.
 * @param plainPassword - The user's input password.
 * @param hashedPassword - The stored hashed password.
 * @returns A boolean indicating if the password matches.
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
