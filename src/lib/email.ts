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
  console.log(`👉 OTP CODE  : ${otp}`);
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
        `[Resend Email Dispatch Error]:`,
        resendErr instanceof Error ? resendErr.message : resendErr
      );
    }
  }

  return { success: true };
}

export async function sendPasswordResetEmail({
  email,
  adminName,
  resetLink,
}: {
  email: string;
  adminName: string;
  resetLink: string;
}) {
  const sender = process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>";
  const subject = "Password Reset Instructions - T2T Admin Portal";

  console.log(`\n==================================================`);
  console.log(`🔑 [T2T ADMIN PASSWORD RESET LINK]`);
  console.log(`Target Email : ${email}`);
  console.log(`Admin Name   : ${adminName}`);
  console.log(`👉 RESET LINK : ${resetLink}`);
  console.log(`==================================================\n`);

  if (resend) {
    try {
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #0A0A0C; border: 1px solid #222; border-radius: 16px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #14EF10; margin: 0; font-size: 22px; font-weight: 800;">Trash2Treasure Admin Portal</h2>
            <p style="color: #888888; font-size: 13px; margin-top: 4px;">Security & Administrator Account Recovery</p>
          </div>
          
          <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">Hello <strong>${adminName}</strong>,</p>
          <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">
            We received a password reset request for your administrator account (<code>${email}</code>). Click the secure button below to set a new password:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="background-color: #14EF10; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; font-size: 14px; box-shadow: 0 0 15px rgba(20,239,16,0.4);">
              Reset Administrator Password
            </a>
          </div>

          <p style="color: #888888; font-size: 12px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #14EF10; word-break: break-all; font-size: 11px;">${resetLink}</a>
          </p>

          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />

          <p style="color: #666666; font-size: 11px; text-align: center; margin: 0;">
            If you did not request a password reset, please ignore this email or contact security immediately.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: sender,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[Resend Password Reset Email Sent] to ${email}`);
    } catch (resendErr) {
      console.warn(
        `[Resend Password Reset Warning]:`,
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
