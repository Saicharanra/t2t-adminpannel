import { Resend } from "resend";
import { AdminOtpEmail } from "@/components/emails/AdminOtpEmail";
import * as React from "react";

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
  try {
    const sender = process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>";
    const subject = `Your T2T Admin Verification Code: ${otp}`;

    if (resend) {
      await resend.emails.send({
        from: sender,
        to: email,
        subject,
        react: React.createElement(AdminOtpEmail, {
          adminName,
          otp,
          ipAddress,
          browser,
          os,
          loginTime,
        }),
      });
      console.log(`[Resend React Email Delivered] OTP sent to ${email}`);
    } else {
      console.log(`\n==================================================`);
      console.log(`[ENTERPRISE REACT OTP GENERATED (SIMULATED)]`);
      console.log(`Email: ${email}`);
      console.log(`Name: ${adminName}`);
      console.log(`Code: ${otp}`);
      console.log(`IP: ${ipAddress}`);
      console.log(`Browser: ${browser} | OS: ${os}`);
      console.log(`Time: ${loginTime}`);
      console.log(`==================================================\n`);
    }
    return { success: true };
  } catch (error) {
    console.error("[sendOtpEmail Error]:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
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
      console.log(`Content (HTML): ${html.substring(0, 500)}${html.length > 500 ? "..." : ""}`);
      if (text) console.log(`Content (Text): ${text}`);
      console.log(`==================================================\n`);
    }
    return { success: true };
  } catch (error) {
    console.error("[sendEmail Error]:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
