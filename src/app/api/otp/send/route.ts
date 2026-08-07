import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendOtpEmail } from "@/lib/email";
import { parseUserAgent, hashOtp } from "@/lib/auth-crypto";
import crypto from "crypto";
import { z } from "zod";

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();
    const result = sendOtpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Rate Limit / Spam Prevention: check if too many OTPs sent to this email recently
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount, error: countError } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneMinuteAgo);

    if (countError) {
      console.error("[OTP Send Route - Rate Limit Check DB Error]:", countError);
    }

    if (recentCount !== null && recentCount >= 2) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Please wait a minute before requesting another." },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins expiry

    // Mark previous unused OTPs for this email as used
    try {
      await supabase
        .from("otp_codes")
        .update({ is_used: true })
        .eq("email", email)
        .eq("is_used", false);
    } catch (e) {}

    // Create new OTP code record in database
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        code: otpHash,
        expires_at: expiresAt,
        is_used: false,
      });

    if (insertError) {
      console.error("[OTP Send Route - Insertion Error]:", insertError);
      return NextResponse.json(
        { success: false, error: `Database error saving verification code: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Query admin name if exists in database
    const { data: admin, error: adminQueryError } = await supabase
      .from("admins")
      .select("name")
      .eq("email", email)
      .maybeSingle();

    if (adminQueryError) {
      console.error("[OTP Send Route - Admin Query Error]:", adminQueryError);
      // Proceed anyway, fallback name is handled below
    }

    const adminName = admin?.name || "Administrator";

    // Extract headers information
    const userAgent = request.headers.get("user-agent") || null;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const { browser, os } = parseUserAgent(userAgent);

    // Send email using React template sendOtpEmail helper
    const emailRes = await sendOtpEmail({
      email,
      adminName,
      otp: code,
      ipAddress,
      browser,
      os,
      loginTime: new Date().toLocaleString(),
    });

    if (!emailRes.success) {
      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("[OTP Send Route Error]:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
