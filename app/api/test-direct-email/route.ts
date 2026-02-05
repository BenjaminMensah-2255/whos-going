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

    console.log(`🧪 Testing direct email send to: ${email}`);

    const result = await sendNewRunEmail(email, {
      vendorName: 'Test Vendor (KFC)',
      runnerName: 'Test Runner (Benjamin)',
      departureTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      runId: 'test-run-id-123',
      note: 'This is a test email to debug email delivery',
    });

    console.log(`📧 Test email result:`, result);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Test email sent successfully to ${email}` 
        : `Failed to send: ${result.error}`,
      error: result.error,
    });
  } catch (error) {
    console.error('❌ Test email endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 }
    );
  }
}
