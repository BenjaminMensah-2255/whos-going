import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';

export async function GET() {
  try {
    await dbConnect();

    const allUsers = await User.find({}).select('name email notificationsEnabled').lean();
    
    const usersWithEmail = allUsers.filter(u => u.email);
    const usersWithNotifications = allUsers.filter(u => u.email && u.notificationsEnabled);

    return NextResponse.json({
      success: true,
      totalUsers: allUsers.length,
      usersWithEmail: usersWithEmail.length,
      usersWithNotifications: usersWithNotifications.length,
      users: allUsers.map(u => ({
        name: u.name,
        email: u.email || 'No email',
        notificationsEnabled: u.notificationsEnabled || false,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check users' },
      { status: 500 }
    );
  }
}
