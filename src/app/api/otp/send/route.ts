import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { parseUserAgent } from "@/lib/auth-crypto";
import crypto from "crypto";
import { z } from "zod";

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
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
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCount = await prisma.oTPCode.count({
      where: {
        email,
        createdAt: { gte: oneMinuteAgo },
      },
    });
    if (recentCount >= 2) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Please wait a minute before requesting another." },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    // Mark previous unused OTPs for this email as used/inactive
    await prisma.oTPCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Create new OTP code record in database
    await prisma.oTPCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Query admin/user name if exists in database
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
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
    console.error("[OTP Send Error]:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

