import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';

export async function POST(request: Request) {
  try {
    const { oldName, newName, newEmail } = await request.json();

    if (!oldName || !newName || !newEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by old name
    const user = await User.findOne({ name: oldName });
    
    if (!user) {
      return NextResponse.json(
        { error: `User "${oldName}" not found` },
        { status: 404 }
      );
    }

    // Update user
    user.name = newName;
    user.email = newEmail;
    user.notificationsEnabled = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Updated user from "${oldName}" to "${newName}" with email ${newEmail}`,
      user: {
        name: user.name,
        email: user.email,
        notificationsEnabled: user.notificationsEnabled,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
