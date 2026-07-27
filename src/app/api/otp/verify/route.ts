import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";

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

    // Find the most recent active OTP for this email
    const { data: activeOtp, error: activeOtpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("used", false)
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

    if (!activeOtp) {
      return NextResponse.json(
        { success: false, error: "No active verification code found, or code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (activeOtp.attempts >= 3) {
      // Mark as used so it cannot be tried anymore
      const { error: invalidateError } = await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", activeOtp.id);

      if (invalidateError) {
        console.error("[OTP Verify Route - Invalidate Code Error]:", invalidateError);
      }

      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Code has been invalidated. Please request a new one." },
        { status: 400 }
      );
    }

    // Compare code
    if (activeOtp.code !== code) {
      // Increment attempts
      const newAttempts = activeOtp.attempts + 1;
      const { data: updated, error: updateError } = await supabase
        .from("otp_codes")
        .update({ attempts: newAttempts })
        .eq("id", activeOtp.id)
        .select()
        .single();

      if (updateError) {
        console.error("[OTP Verify Route - Increment Attempts Error]:", updateError);
        return NextResponse.json(
          { success: false, error: `Database error updating attempts: ${updateError.message}` },
          { status: 500 }
        );
      }

      const remaining = 3 - updated.attempts;
      if (remaining <= 0) {
        const { error: finalInvalidateError } = await supabase
          .from("otp_codes")
          .update({ used: true })
          .eq("id", activeOtp.id);

        if (finalInvalidateError) {
          console.error("[OTP Verify Route - Final Invalidate Error]:", finalInvalidateError);
        }

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
    const { error: markUsedError } = await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", activeOtp.id);

    if (markUsedError) {
      console.error("[OTP Verify Route - Mark Used Error]:", markUsedError);
      return NextResponse.json(
        { success: false, error: `Database error marking OTP as used: ${markUsedError.message}` },
        { status: 500 }
      );
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
