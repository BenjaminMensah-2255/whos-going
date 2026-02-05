import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log(`🧪 Testing email to: ${email}`);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Who\'s Going <onboarding@resend.dev>',
      to: email,
      subject: '✅ Email Test - Who\'s Going',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background-color: #FAF8F5;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                padding: 32px;
                border: 1px solid #D4CFC4;
              }
              h1 {
                color: #2C2C2C;
              }
              .success {
                background: #dcfce7;
                color: #166534;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Email Test Successful!</h1>
              <div class="success">
                <p><strong>Congratulations!</strong></p>
                <p>Your email configuration is working correctly. You will now receive notifications when new runs are posted.</p>
              </div>
              <p style="color: #8B8680; font-size: 12px;">
                This is a test email from Who's Going app.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ Test email sent successfully. ID: ${result.data?.id}`);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result.data?.id,
    });
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
