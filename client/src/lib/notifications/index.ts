/**
 * Notification System
 * Handles SMS and Email notifications
 *
 * STUBBED VERSION - Logs to console instead of actually sending
 * To implement real notifications:
 * 1. Add API keys to .env.local (TWILIO_*, SENDGRID_*)
 * 2. Uncomment real implementations in sms.ts and email.ts
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
 * Send lead notification to vendor (SMS + Email)
 */
export async function sendLeadNotification(data: LeadNotification): Promise<void> {
  console.log('\n🔔 [NOTIFICATION - STUBBED] New Lead Notification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 To: ${data.vendorEmail}`);
  console.log(`📱 SMS: ${data.vendorPhone}`);
  console.log(`🏢 Vendor: ${data.vendorName}`);
  console.log(`📅 Event Date: ${data.eventDate}`);
  console.log(`👥 Guests: ${data.guestCount}`);
  console.log(`💰 Budget: $${data.budget}`);
  console.log(`🎓 Organization: ${data.plannerOrganization}`);
  console.log(`🔗 Lead URL: ${data.leadUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // In production, this would call Twilio and SendGrid
  // await sendSMS(data.vendorPhone, `New event lead! ${data.guestCount} guests, $${data.budget}...`);
  // await sendEmail(data.vendorEmail, 'New Event Lead', emailTemplate);
}

/**
 * Send message notification (Email only)
 */
export async function sendMessageNotification(data: MessageNotification): Promise<void> {
  console.log('\n💬 [NOTIFICATION - STUBBED] New Message Notification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 To: ${data.recipientEmail} (${data.recipientName})`);
  console.log(`👤 From: ${data.senderName}`);
  console.log(`📝 Message: "${data.messagePreview}"`);
  console.log(`🔗 View: ${data.leadUrl}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // In production, this would call SendGrid
  // await sendEmail(data.recipientEmail, 'New Message', emailTemplate);
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
  console.log('\n✅ [NOTIFICATION - STUBBED] Vendor Verification Notification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 To: ${email}`);
  console.log(`🏢 Business: ${businessName}`);
  console.log(`📊 Status: ${status.toUpperCase()}`);
  if (reason) {
    console.log(`📄 Reason: ${reason}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // In production, this would call SendGrid
  // await sendEmail(email, `Vendor Application ${status}`, emailTemplate);
}

/*
// REAL IMPLEMENTATIONS (create separate files when ready)
// File: src/lib/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, body: string): Promise<void> {
  await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  });
}

// File: src/lib/notifications/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await sgMail.send({
    to,
    from: 'noreply@dameventplatform.com', // Must be verified in SendGrid
    subject,
    html,
  });
}
*/
