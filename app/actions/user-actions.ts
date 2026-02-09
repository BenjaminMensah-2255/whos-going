'use server';

import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { setCurrentUserId, getCurrentUser as getUser } from '@/lib/auth';

/**
 * Login or create a user by name
 */
export async function loginUser(name: string, email?: string, phoneNumber?: string) {
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

    // Validate phone number
    const trimmedPhone = phoneNumber?.trim();
    if (!trimmedPhone) {
      return { success: false, error: 'Phone number is required' };
    }

    // Find existing user by email
    let user = await User.findOne({ email: trimmedEmail });
    
    if (user) {
      // Update user details if they exist
      let hasChanges = false;
      
      if (user.name !== trimmedName) {
        user.name = trimmedName;
        hasChanges = true;
      }
      
      if (user.phoneNumber !== trimmedPhone) {
        user.phoneNumber = trimmedPhone;
        hasChanges = true;
      }
      
      if (hasChanges) {
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({ 
        name: trimmedName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone,
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
