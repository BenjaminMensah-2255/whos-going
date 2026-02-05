import { NextResponse } from 'next/server';
import { sendNewRunEmail } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Gmail credentials not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD in .env.local' },
        { status: 500 }
      );
    }

    console.log(`🧪 Testing email to: ${email}`);

    const result = await sendNewRunEmail(email, {
      vendorName: 'Test Vendor (KFC)',
      runnerName: 'Test User',
      departureTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      runId: 'test-123',
      note: 'This is a test email from Who\'s Going!',
    });

    if (result.success) {
      console.log(`✅ Test email sent successfully to ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox (and spam folder).',
      });
    } else {
      console.error(`❌ Test email failed:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}
