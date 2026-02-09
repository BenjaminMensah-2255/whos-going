'use server';

import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { Run } from '@/lib/db/models/Run';
import { Item } from '@/lib/db/models/Item';

const ADMIN_COOKIE_NAME = 'whos-going-admin';

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return adminCookie === 'authenticated';
}

/**
 * Admin login
 */
export async function adminLogin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return { success: true };
  }
  
  return { success: false, error: 'Invalid password' };
}

/**
 * Admin logout
 */
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Get all users with statistics
 */
export async function getAllUsers() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Get run counts for each user
    const userStats = await Promise.all(
      users.map(async (user) => {
        const runCount = await Run.countDocuments({ runnerUserId: user._id });
        const itemCount = await Item.countDocuments({ userId: user._id });
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
          phoneNumber: user.phoneNumber || null,
          emailVerified: user.emailVerified || false,
          notificationsEnabled: user.notificationsEnabled || false,
          createdAt: user.createdAt.toISOString(),
          runCount,
          itemCount,
        };
      })
    );

    return { success: true, users: userStats };
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const [
      totalUsers,
      usersWithEmail,
      totalRuns,
      activeRuns,
      totalItems,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ email: { $exists: true, $ne: null } }),
      Run.countDocuments({}),
      Run.countDocuments({ status: { $in: ['open', 'closed'] } }),
      Item.countDocuments({}),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        usersWithEmail,
        usersWithoutEmail: totalUsers - usersWithEmail,
        totalRuns,
        activeRuns,
        completedRuns: totalRuns - activeRuns,
        totalItems,
      },
    };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
}

/**
 * Update user information
 */
export async function updateUserAdmin(userId: string, data: {
  name?: string;
  email?: string;
  phoneNumber?: string;
  notificationsEnabled?: boolean;
}) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.notificationsEnabled !== undefined) {
      user.notificationsEnabled = data.notificationsEnabled;
    }

    await user.save();

    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

/**
 * Delete user (and their runs/items)
 */
export async function deleteUserAdmin(userId: string) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();

    // Delete user's items
    await Item.deleteMany({ userId });

    // Delete user's runs
    await Run.deleteMany({ runnerUserId: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
