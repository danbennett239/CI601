// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '1h';     // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d';    // 7 days

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  hasura_claims: Record<string, any>;
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
  } catch (e) {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/refresh`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  // After successful refresh, we have new cookies set. Get the user again.
  return await getUserFromCookies();
}
