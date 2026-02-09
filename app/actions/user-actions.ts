'use server';

import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { setCurrentUserId, getCurrentUser as getUser } from '@/lib/auth';

/**
 * Login or create a user by name
 */
export async function loginUser(name: string, email?: string) {
  try {
    await dbConnect();

    // Trim and validate name
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    // Validate email
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required' };
    }

    // Find existing user by email
    let user = await User.findOne({ email: trimmedEmail });
    
    if (user) {
      // If user exists, update name if needed (optional, or we could require name match)
      // For now, let's just ensure we return this user. 
      // If the name is DIFFERENT, maybe we should warn? 
      // But the prompt says "login with name and email". 
      // Let's assume broad matching: if email matches, use that user. 
      // If name is different, maybe update it?
      if (user.name !== trimmedName) {
        user.name = trimmedName;
        await user.save();
      }
    } else {
      // Check if name is taken by a DIFFERENT email (unlikely if unique constraint is on email, but possible on name?)
      // We don't have unique constraint on name in schema.
      
      // Create new user
      user = await User.create({ 
        name: trimmedName,
        email: trimmedEmail,
        notificationsEnabled: true,
      });
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
