import nodemailer from 'nodemailer';

export interface NewRunEmailData {
  vendorName: string;
  runnerName: string;
  departureTime: string;
  runId: string;
  note?: string;
}

export interface ItemAddedEmailData {
  runnerName: string;
  runnerEmail: string;
  requesterName: string;
  itemName: string;
  quantity: number;
  runId: string;
  vendorName: string;
}

// Create reusable transporter
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};


export async function sendNewRunEmail(
  to: string,
  data: NewRunEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email transporter not configured' };
    }

    const departureDate = new Date(data.departureTime);
    const formattedTime = departureDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const runUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/runs/${data.runId}`;

    const mailOptions = {
      from: `"Who's Going" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🏃 ${data.runnerName} is going to ${data.vendorName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2C2C2C;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #FFFBF5;
                border: 2px solid #E8DCC8;
                border-radius: 12px;
                padding: 30px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .emoji {
                font-size: 48px;
                margin-bottom: 10px;
              }
              h1 {
                color: #2C2C2C;
                margin: 0 0 10px 0;
                font-size: 24px;
              }
              .vendor {
                color: #8B4513;
                font-size: 28px;
                font-weight: bold;
                margin: 10px 0;
              }
              .info-box {
                background: white;
                border: 1px solid #E8DCC8;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-row {
                margin: 10px 0;
              }
              .label {
                color: #666;
                font-size: 14px;
              }
              .value {
                color: #2C2C2C;
                font-size: 16px;
                font-weight: 500;
              }
              .button {
                display: inline-block;
                background: #8B4513;
                color: white !important;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E8DCC8;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🏃</div>
                <h1>New Run Posted!</h1>
              </div>
              
              <p style="color: #2C2C2C; font-size: 16px;">
                <strong>${data.runnerName}</strong> is making a run to:
              </p>
              
              <div class="vendor">${data.vendorName}</div>
              
              <div class="info-box">
                <div class="info-row">
                  <div class="label">Departure Time</div>
                  <div class="value">⏰ ${formattedTime}</div>
                </div>
                
                ${data.note ? `
                <div class="info-row">
                  <div class="label">Note</div>
                  <div class="value">💬 ${data.note}</div>
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
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function sendItemAddedEmail(
  to: string,
  data: ItemAddedEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 Attempting to send item added email to: ${to}`);
    
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, error: 'Email transporter not configured' };
    }

    const runUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/runs/${data.runId}`;

    const mailOptions = {
      from: `"Who's Going" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🛍️ ${data.requesterName} added an item to your run!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2C2C2C;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #FFFBF5;
                border: 2px solid #E8DCC8;
                border-radius: 12px;
                padding: 30px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .emoji {
                font-size: 48px;
                margin-bottom: 10px;
              }
              h1 {
                color: #2C2C2C;
                margin: 0 0 10px 0;
                font-size: 24px;
              }
              .vendor {
                color: #8B4513;
                font-size: 20px;
                font-weight: bold;
                margin: 5px 0 20px 0;
              }
              .info-box {
                background: white;
                border: 1px solid #E8DCC8;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-row {
                margin: 10px 0;
              }
              .label {
                color: #666;
                font-size: 14px;
              }
              .value {
                color: #2C2C2C;
                font-size: 18px;
                font-weight: 500;
              }
              .button {
                display: inline-block;
                background: #8B4513;
                color: white !important;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E8DCC8;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🛍️</div>
                <h1>New Item Added!</h1>
                <div class="vendor">Run: ${data.vendorName}</div>
              </div>
              
              <p style="color: #2C2C2C; font-size: 16px;">
                <strong>${data.requesterName}</strong> just added an item to your run.
              </p>
              
              <div class="info-box">
                <div class="info-row">
                  <div class="label">Item</div>
                  <div class="value">${data.itemName}</div>
                </div>
                
                <div class="info-row">
                  <div class="label">Quantity</div>
                  <div class="value">x${data.quantity}</div>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${runUrl}" class="button">View Run & Checklist</a>
              </p>
              
              <div class="footer">
                <p>You're receiving this because you created this run in Who's Going.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Item added email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send item added email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Notify all users (except the runner) about a new run
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
