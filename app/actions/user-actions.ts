'use server';

import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { setCurrentUserId, getCurrentUser as getUser } from '@/lib/auth';

/**
 * Login or create a user by name
 */
export async function loginUser(name: string) {
  try {
    await dbConnect();

    // Trim and validate name
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    // Find existing user or create new one
    let user = await User.findOne({ name: trimmedName });
    
    if (!user) {
      user = await User.create({ name: trimmedName });
    }

    // Set auth cookie
    await setCurrentUserId(user._id.toString());

    return { success: true, userId: user._id.toString() };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to login' };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const user = await getUser();
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
