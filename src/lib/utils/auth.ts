// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '1h';     // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d';    // 7 days
const SALT_ROUNDS = 10;

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  practice_id?: string;
  hasura_claims: Record<string, unknown>;
}

export function signAccessToken(payload: UserPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: UserPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Returns the user from currently set cookies (accessToken/refreshToken).
 * If tokens are missing or invalid, returns null.
 * This function does NOT handle refreshing. It simply returns user data if valid.
 */
export async function getUserFromCookies(): Promise<UserPayload | null> {
  // If cookies() returns a Promise in your environment, await it:
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken && !refreshToken) return null;

  // Verify access token
  if (accessToken) {
    const user = verifyToken(accessToken);
    if (user) {
      return user;
    }
  }

  // If no valid access token, return null. Refreshing is handled elsewhere.
  return null;
}

/**
 * Attempts to refresh the user's access token by calling the /api/refresh endpoint.
 * If successful, returns a fresh UserPayload. If not, returns null.
 * Intended to be called from a server component or server action.
 */
export async function tryRefreshUser(): Promise<UserPayload | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/auth/refresh`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  // After successful refresh, we have new cookies set. Get the user again.
  return await getUserFromCookies();
}

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

