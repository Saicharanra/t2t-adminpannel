import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    // Find the most recent active OTP for this email
    const activeOtp = await prisma.oTPCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!activeOtp) {
      return NextResponse.json(
        { success: false, error: "No active verification code found, or code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (activeOtp.attempts >= 3) {
      // Mark as used so it cannot be tried anymore
      await prisma.oTPCode.update({
        where: { id: activeOtp.id },
        data: { used: true },
      });
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Code has been invalidated. Please request a new one." },
        { status: 400 }
      );
    }

    // Compare code
    if (activeOtp.code !== code) {
      // Increment attempts
      const updated = await prisma.oTPCode.update({
        where: { id: activeOtp.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      const remaining = 3 - updated.attempts;
      if (remaining <= 0) {
        await prisma.oTPCode.update({
          where: { id: activeOtp.id },
          data: { used: true },
        });
        return NextResponse.json(
          { success: false, error: "Too many failed attempts. Code has been invalidated. Please request a new one." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Invalid verification code. ${remaining} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP matches and is valid! Mark it as used.
    await prisma.oTPCode.update({
      where: { id: activeOtp.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: "Verification successful.",
    });
  } catch (err) {
    console.error("[OTP Verify Error]:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
