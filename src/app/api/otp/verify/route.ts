import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";

import { hashOtp } from "@/lib/auth-crypto";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});

export async function POST(request: Request) {
  const supabase = createAdminClient();

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
    const inputHash = hashOtp(code);

    // Find the most recent active OTP for this email
    const { data: activeOtp, error: activeOtpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("is_used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeOtpError) {
      console.error("[OTP Verify Route - Active OTP Query Error]:", activeOtpError);
      return NextResponse.json(
        { success: false, error: `Database error verifying code: ${activeOtpError.message}` },
        { status: 500 }
      );
    }

    if (!activeOtp || activeOtp.code !== inputHash) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    // OTP matches and is valid! Mark it as used.
    try {
      await supabase
        .from("otp_codes")
        .update({ is_used: true })
        .eq("id", activeOtp.id);
    } catch (markErr) {
      console.error("[OTP Verify Route - Mark Used Error]:", markErr);
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful.",
    });

  } catch (err) {
    console.error("[OTP Verify Route Error]:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
