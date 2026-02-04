import { cookies } from 'next/headers';
import { User } from './db/models/User';
import dbConnect from './db/mongodb';

const AUTH_COOKIE_NAME = 'whos-going-user-id';

/**
 * Get the current authenticated user ID from cookies
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return userId || null;
}

/**
 * Get the current authenticated user from database
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  await dbConnect();
  const user = await User.findById(userId);
  return user;
}

/**
 * Set the authenticated user ID in cookies
 */
export async function setCurrentUserId(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Clear the authentication cookie
 */
export async function clearAuth() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return !!userId;
}
