/**
 * Notification System
 * Handles SMS and Email notifications
 *
 * Uses Twilio and SendGrid if configured, falls back to console logs otherwise
 */

export interface LeadNotification {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  eventDate: string;
  guestCount: number;
  budget: number;
  leadUrl: string;
  plannerOrganization: string;
}

export interface MessageNotification {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  leadUrl: string;
}

/**
 * Send SMS via Twilio (if configured)
 */
async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[SMS - STUB] Would send to ${to}: ${body}`);
    return;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    console.log(`✅ SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    // Don't throw - we don't want notifications to block the main flow
  }
}

/**
 * Send Email via SendGrid (if configured)
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@dameventplatform.com';

  if (!apiKey) {
    console.log(`[EMAIL - STUB] Would send to ${to}: ${subject}`);
    return;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: { email: fromEmail },
        content: [{
          type: 'text/html',
          value: html,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - we don't want notifications to block the main flow
  }
}

/**
 * Send lead notification to vendor (SMS + Email)
 */
export async function sendLeadNotification(data: LeadNotification): Promise<void> {
  console.log(`\n🔔 Sending lead notification to ${data.vendorName}`);

  // Send SMS
  const smsBody = `New event lead! ${data.guestCount} guests, $${data.budget}, ${data.eventDate}. View: ${data.leadUrl}`;
  await sendSMS(data.vendorPhone, smsBody);

  // Send Email
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">New Event Lead - DAM Event Platform</h2>
      <p>Hi ${data.vendorName},</p>
      <p>You have a new event lead from <strong>${data.plannerOrganization}</strong>!</p>

      <div style="background-color: #F1F5F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p><strong>Date:</strong> ${data.eventDate}</p>
        <p><strong>Guests:</strong> ${data.guestCount}</p>
        <p><strong>Budget:</strong> $${data.budget.toLocaleString()}</p>
      </div>

      <p>
        <a href="${data.leadUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
          View Lead Details & Respond
        </a>
      </p>

      <p style="color: #64748B; font-size: 14px;">
        Respond quickly to increase your chances of booking! The planner is waiting to hear from you.
      </p>
    </div>
  `;

  await sendEmail(data.vendorEmail, 'New Event Lead - DAM Event Platform', emailHtml);
}

/**
 * Send message notification (Email only)
 */
export async function sendMessageNotification(data: MessageNotification): Promise<void> {
  console.log(`\n💬 Sending message notification to ${data.recipientName}`);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">New Message - DAM Event Platform</h2>
      <p>Hi ${data.recipientName},</p>
      <p>You received a new message from <strong>${data.senderName}</strong>:</p>

      <div style="background-color: #F1F5F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">"${data.messagePreview}"</p>
      </div>

      <p>
        <a href="${data.leadUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
          View & Reply
        </a>
      </p>
    </div>
  `;

  await sendEmail(data.recipientEmail, `New message from ${data.senderName}`, emailHtml);
}

/**
 * Send vendor verification notification (Email only)
 */
export async function sendVendorVerificationNotification(
  email: string,
  businessName: string,
  status: 'verified' | 'rejected',
  reason?: string
): Promise<void> {
  console.log(`\n✅ Sending verification notification to ${businessName}`);

  const isVerified = status === 'verified';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isVerified ? '#10B981' : '#EF4444'};">
        Vendor Application ${isVerified ? 'Approved' : 'Update'} - DAM Event Platform
      </h2>
      <p>Hi ${businessName},</p>

      ${isVerified ? `
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3 style="color: #065F46; margin-top: 0;">🎉 Congratulations!</h3>
          <p style="color: #065F46;">Your vendor profile has been approved. You can now start receiving leads from event planners!</p>
        </div>

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            Go to Dashboard
          </a>
        </p>
      ` : `
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3 style="color: #991B1B; margin-top: 0;">Application Status</h3>
          <p style="color: #991B1B;">
            Unfortunately, we are unable to approve your vendor application at this time.
          </p>
          ${reason ? `<p style="color: #991B1B;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>

        <p>
          If you have questions, please contact our support team.
        </p>
      `}
    </div>
  `;

  await sendEmail(
    email,
    `DAM Event Platform - Vendor Application ${isVerified ? 'Approved' : 'Update'}`,
    emailHtml
  );
}
