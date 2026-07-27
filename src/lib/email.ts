import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOtpEmail(email: string, code: string) {
  try {
    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>",
        to: email,
        subject: `Your T2T Admin Verification Code: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background-color: #ffffff; color: #111827; border: 1px solid #E5E7EB; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 44px; height: 44px; background-color: #4F772D; border-radius: 10px; line-height: 44px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">T2T</div>
              <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 12px 0 4px 0;">Trash2Treasure Admin</h2>
              <p style="color: #6B7280; font-size: 13px; margin: 0;">Operations Center Security Portal</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 20px 0;" />

            <p style="color: #374151; font-size: 15px; line-height: 1.5; margin-bottom: 16px;">
              A login request was received for your Trash2Treasure Administrator account. Enter the 6-digit verification code below to complete sign in:
            </p>

            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4F772D; padding: 20px; background-color: #F4F7F2; border: 1px dashed #A3B18A; border-radius: 12px; text-align: center; margin: 24px 0;">
              ${code}
            </div>

            <p style="color: #6B7280; font-size: 13px; margin-bottom: 20px; text-align: center;">
              ⏱️ <strong>This code expires in 5 minutes.</strong>
            </p>

            <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
              <p style="color: #92400E; font-size: 12px; margin: 0; line-height: 1.4;">
                <strong>Security Notice:</strong> Never share this verification code with anyone. Trash2Treasure staff will never ask for your code. If you did not request this login, please contact system administrator immediately.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`[Resend Email Delivered] OTP sent to ${email}`);
    } else {
      console.log(`\n==================================================`);
      console.log(`[ENTERPRISE OTP GENERATED] Email: ${email} | Code: ${code}`);
      console.log(`==================================================\n`);
    }
    return { success: true };
  } catch (error) {
    console.error("[sendOtpEmail Error]:", error);
    return { success: false, error };
  }
}
