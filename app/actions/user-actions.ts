'use server';

import { redirect } from 'next/navigation';
import crypto from 'crypto';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { setCurrentUserId, getCurrentUser as getUser, clearAuth } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/email/resend';

/**
 * Logout the current user
 */
export async function logoutUser() {
  await clearAuth();
  redirect('/login');
}

/**
 * Request a magic link for login
 */
export async function requestMagicLink(email: string) {
  try {
    await dbConnect();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required' };
    }

    // Find or create user
    let user = await User.findOne({ email: trimmedEmail });
    
    if (!user) {
      // Create new user with just email
      // Name and phone will be collected in onboarding
      user = await User.create({ 
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0], // Temporary name
        phoneNumber: '', // Empty initially
        notificationsEnabled: true,
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Set expiry (15 minutes)
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save hashed token to user
    user.authToken = tokenHash;
    user.authTokenExpiry = expiry;
    await user.save();

    // Generate magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${appUrl}/verify?token=${token}`;

    // Send email
    const emailResult = await sendMagicLinkEmail(trimmedEmail, magicLink);

    if (!emailResult.success) {
      return { success: false, error: 'Failed to send email. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Request magic link error:', error);
    return { success: false, error: 'Failed to request login link' };
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token: string) {
  try {
    await dbConnect();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid, non-expired token
    const user = await User.findOne({
      authToken: tokenHash,
      authTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return { success: false, error: 'Invalid or expired link' };
    }

    // Clear token
    user.authToken = undefined;
    user.authTokenExpiry = undefined;
    await user.save();

    // Log user in
    await setCurrentUserId(user._id.toString());

    // Check if onboarding is needed
    // Consider onboarding needed if name matches email part (default) or phone is missing
    const isDefaultName = user.name === user.email.split('@')[0];
    const needsOnboarding = isDefaultName || !user.phoneNumber;

    return { success: true, needsOnboarding };
  } catch (error) {
    console.error('Verify magic link error:', error);
    return { success: false, error: 'Failed to verify link' };
  }
}

/**
 * Update user profile (Onboarding)
 */
export async function updateProfile(data: { name: string; phoneNumber: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate inputs
    const trimmedName = data.name.trim();
    const trimmedPhone = data.phoneNumber.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    if (!trimmedPhone) {
      return { success: false, error: 'Phone number is required' };
    }
    
    await dbConnect();
    
    const dbUser = await User.findById(user.id);
    if (!dbUser) return { success: false, error: 'User not found' };

    dbUser.name = trimmedName;
    dbUser.phoneNumber = trimmedPhone;
    await dbUser.save();

    return { success: true };
  } catch (error) {
     console.error('Update profile error:', error);
     return { success: false, error: 'Failed to update profile' };
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
      email: user.email,
      phoneNumber: user.phoneNumber,
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
