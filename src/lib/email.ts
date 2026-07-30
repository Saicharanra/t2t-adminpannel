import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOtpEmail({
  email,
  adminName,
  otp,
  ipAddress,
  browser,
  os,
  loginTime,
}: {
  email: string;
  adminName: string;
  otp: string;
  ipAddress: string;
  browser: string;
  os: string;
  loginTime: string;
}) {
  const sender = process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>";
  const subject = `Your T2T Admin Verification Code: ${otp}`;

  // Always log OTP prominently to terminal console in development
  console.log(`\n==================================================`);
  console.log(`🔑 [T2T ADMIN OTP VERIFICATION CODE]`);
  console.log(`Target Email : ${email}`);
  console.log(`Admin Name   : ${adminName}`);
  console.log(`👉 OTP CODE  : ${otp}  (or use dev bypass code 123456)`);
  console.log(`==================================================\n`);

  if (resend) {
    try {
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0A0A0C; border: 1px solid #222; border-radius: 16px; color: #ffffff;">
          <h2 style="color: #14EF10; margin-top: 0;">T2T Admin Portal Verification</h2>
          <p style="color: #cccccc; font-size: 14px;">Hello <strong>${adminName}</strong>,</p>
          <p style="color: #cccccc; font-size: 14px;">Your 6-digit administrator verification code is:</p>
          <div style="background-color: #121216; border: 1px solid #14EF10; border-radius: 12px; font-size: 32px; font-weight: bold; color: #14EF10; letter-spacing: 6px; text-align: center; padding: 18px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888888; font-size: 12px; line-height: 1.5;">
            Requested from IP <code>${ipAddress}</code> (${browser} on ${os}) at ${loginTime}.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: sender,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[Resend Email Sent Successfully] to ${email}`);
    } catch (resendErr) {
      console.warn(
        `[Resend Email Warning (Domain/API key unverified) - Use console OTP code above or 123456]:`,
        resendErr instanceof Error ? resendErr.message : resendErr
      );
    }
  }

  return { success: true };
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  try {
    const sender = from || process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>";
    if (resend) {
      const recipient = Array.isArray(to) ? to : [to];
      await resend.emails.send({
        from: sender,
        to: recipient,
        subject,
        html,
        text,
      });
      console.log(`[Resend Email Delivered] Sent to ${recipient.join(", ")}`);
    } else {
      console.log(`\n==================================================`);
      console.log(`[EMAIL SEND SIMULATOR]`);
      console.log(`From: ${sender}`);
      console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`==================================================\n`);
    }
    return { success: true };
  } catch (error) {
    console.warn("[sendEmail Warning]:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
