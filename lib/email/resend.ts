import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NewRunEmailData {
  vendorName: string;
  runnerName: string;
  departureTime: string;
  runId: string;
  note?: string;
}

/**
 * Send email notification to a user about a new run
 */
export async function sendNewRunEmail(
  to: string,
  data: NewRunEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      return { success: false, error: 'Resend API key not configured' };
    }

    const departureDate = new Date(data.departureTime);
    const formattedTime = departureDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const runUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/runs/${data.runId}`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Who\'s Going <onboarding@resend.dev>',
      to,
      subject: `🏃 ${data.runnerName} is going to ${data.vendorName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
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
                font-size: 24px;
                margin: 0 0 16px 0;
              }
              .vendor {
                font-size: 28px;
                font-weight: bold;
                color: #2C2C2C;
                margin: 8px 0;
              }
              .info {
                background: #E8E3DA;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .info-item {
                margin: 8px 0;
                color: #2C2C2C;
              }
              .label {
                font-weight: 500;
                color: #8B8680;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                background: #2C2C2C;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              }
              .footer {
                margin-top: 32px;
                padding-top: 20px;
                border-top: 1px solid #D4CFC4;
                color: #8B8680;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏃 New Run Posted!</h1>
              
              <div class="vendor">${data.vendorName}</div>
              
              <div class="info">
                <div class="info-item">
                  <span class="label">Runner:</span> ${data.runnerName}
                </div>
                <div class="info-item">
                  <span class="label">Leaving at:</span> ${formattedTime}
                </div>
                ${data.note ? `
                <div class="info-item">
                  <span class="label">Note:</span> ${data.note}
                </div>
                ` : ''}
              </div>
              
              <p style="color: #2C2C2C;">
                Want to add items to this run? Click below to join!
              </p>
              
              <a href="${runUrl}" class="button">View Run & Add Items</a>
              
              <div class="footer">
                <p>You're receiving this because you have notifications enabled in Who's Going.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ Email sent successfully to ${to}. Email ID: ${result.data?.id}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send new run notifications to all users with notifications enabled
 */
export async function notifyUsersAboutNewRun(
  data: NewRunEmailData,
  excludeUserId: string
): Promise<{ sent: number; failed: number }> {
  try {
    console.log('📬 Starting email notification process...');
    
    const { User } = await import('@/lib/db/models/User');
    const dbConnect = (await import('@/lib/db/mongodb')).default;
    
    await dbConnect();

    // Get all users with email and notifications enabled, excluding the runner
    const users = await User.find({
      _id: { $ne: excludeUserId },
      email: { $exists: true, $ne: null },
      notificationsEnabled: true,
    }).select('email name');

    console.log(`📊 Found ${users.length} users with notifications enabled`);

    if (users.length === 0) {
      console.log('⚠️  No users to notify (no emails or notifications disabled)');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Send emails (in production, consider using a queue for this)
    for (const user of users) {
      if (user.email) {
        const result = await sendNewRunEmail(user.email, data);
        if (result.success) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send to ${user.name} (${user.email}): ${result.error}`);
        }
      }
    }

    console.log(`📧 Email notification complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('❌ Error notifying users:', error);
    return { sent: 0, failed: 0 };
  }
}
