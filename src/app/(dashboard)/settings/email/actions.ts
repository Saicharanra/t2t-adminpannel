"use server";

export async function getEmailSettings() {
  return {
    resendConfigured: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM || "Trash2Treasure Security <auth@t2t.com>",
  };
}
