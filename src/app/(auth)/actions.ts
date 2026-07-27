"use server";

import { createAdminClient } from "@/lib/supabase";
import { hashOtp, generateDeviceToken, parseUserAgent } from "@/lib/auth-crypto";
import { sendOtpEmail } from "@/lib/email";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid administrator email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d+$/, "OTP must be exactly 6 digits"),
});

/**
 * DB-backed Rate Limiter for secure IP and Account limiting
 */
async function checkRateLimit(
  supabase: ReturnType<typeof createAdminClient>,
  ipAddress: string,
  email: string,
  adminId?: string
): Promise<{ allowed: boolean; error?: string }> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 1000 * 60).toISOString();

  try {
    // 1. IP rate limiting (max 10 actions per minute from same IP)
    const { count: ipActions, error: ipError } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .gte("created_at", oneMinuteAgo);

    if (ipError) {
      console.error("[Rate Limit IP Audit Logs Query Error]:", ipError);
      throw ipError;
    }

    if (ipActions !== null && ipActions > 10) {
      return { allowed: false, error: "Rate limit exceeded. Too many requests from this IP. Please wait 1 minute." };
    }

    // 2. Resend rate limiting (max 3 OTP requests per admin in 5 minutes)
    if (adminId) {
      const { count: emailOtps, error: otpError } = await supabase
        .from("admin_otps")
        .select("*", { count: "exact", head: true })
        .eq("admin_id", adminId)
        .gte("created_at", fiveMinutesAgo);

      if (otpError) {
        console.error("[Rate Limit OTPs Query Error]:", otpError);
        throw otpError;
      }

      if (emailOtps !== null && emailOtps >= 3) {
        return { allowed: false, error: "Verification code requested too frequently. Please wait a few minutes." };
      }
    }
  } catch (error) {
    console.error("[Rate Limit DB Check Error]:", error);
    // Don't block the login flow entirely on rate-limiting DB failures, but log it
  }

  return { allowed: true };
}

export async function requestAdminOtpAction(emailInput: string, passwordInput?: string) {
  const supabase = createAdminClient();

  try {
    const validated = loginSchema.safeParse({ email: emailInput, password: passwordInput });
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid inputs." };
    }

    const { email, password } = validated.data;

    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || null;
    const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const { browser, os } = parseUserAgent(userAgent);

    // Auto-seed default admin ONLY if database has 0 admins
    try {
      const { count: adminCount, error: countError } = await supabase
        .from("admins")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      if (adminCount === 0) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash("Password123!", salt);
        
        const { error: seedError } = await supabase
          .from("admins")
          .insert({
            email: "admin@t2t.com",
            name: "Super Admin",
            password: hashedPassword,
            role: "Super Admin",
          });

        if (seedError) throw seedError;
      }
    } catch (e) {
      console.error("[DB Admin Auto-Seed Error]:", e);
    }

    // Find admin by email
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (adminError) {
      console.error("[Admin Find Query Error]:", adminError);
      return { success: false, error: `Database service unavailable: ${adminError.message}` };
    }

    if (!admin) {
      return { success: false, error: "Administrator account not found." };
    }

    // Apply Rate Limiting
    const rateCheck = await checkRateLimit(supabase, ipAddress, email, admin.id);
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    // Lockout verification
    if (admin.is_locked && admin.locked_until) {
      if (new Date(admin.locked_until) > new Date()) {
        const minutesLeft = Math.ceil(
          (new Date(admin.locked_until).getTime() - Date.now()) / (60 * 1000)
        );
        return {
          success: false,
          error: `Account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
        };
      } else {
        // Lockout expired, reset status
        const { error: unlockError } = await supabase
          .from("admins")
          .update({ is_locked: false, locked_until: null, login_attempts: 0 })
          .eq("id", admin.id);

        if (unlockError) {
          console.error("[Unlock Admin Update Error]:", unlockError);
        }
      }
    }

    // Credentials check using async bcrypt.compare
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      const newAttempts = admin.login_attempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      try {
        const { error: updateError } = await supabase
          .from("admins")
          .update({
            login_attempts: newAttempts,
            is_locked: shouldLock,
            locked_until: lockedUntil,
          })
          .eq("id", admin.id);
        if (updateError) throw updateError;

        const { error: historyError } = await supabase
          .from("admin_login_histories")
          .insert({
            admin_id: admin.id,
            status: "FAILURE",
            ip_address: ipAddress,
            user_agent: userAgent,
          });
        if (historyError) throw historyError;

        const { error: logError } = await supabase
          .from("audit_logs")
          .insert({
            admin_id: admin.id,
            event: "LOGIN_FAILURE",
            ip_address: ipAddress,
            device: userAgent,
            browser,
            os,
          });
        if (logError) throw logError;
      } catch (error) {
        console.error("[Login Failure Logger Error]:", error);
      }

      if (shouldLock) {
        return {
          success: false,
          error: "Too many failed attempts. Account locked for 15 minutes.",
        };
      }

      return { success: false, error: "Invalid email or password." };
    }

    // Trusted Device Bypass
    const cookieStore = await cookies();
    const rawTrustedToken = cookieStore.get("t2t_trusted_device")?.value;

    if (rawTrustedToken) {
      try {
        const hashedToken = crypto.createHash("sha256").update(rawTrustedToken).digest("hex");
        const { data: activeTrust, error: trustError } = await supabase
          .from("trusted_devices")
          .select("*")
          .eq("admin_id", admin.id)
          .eq("device_token", hashedToken)
          .gte("expires_at", new Date().toISOString())
          .maybeSingle();

        if (trustError) throw trustError;

        if (activeTrust) {
          // Create session
          const sessionToken = crypto.randomUUID();
          const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

          const { error: sessionError } = await supabase
            .from("admin_sessions")
            .insert({
              admin_id: admin.id,
              session_token: hashedSessionToken,
              expires_at: expiresAt,
              ip_address: ipAddress,
              user_agent: userAgent,
            });
          if (sessionError) throw sessionError;

          cookieStore.set("t2t_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 28800, // 8 hours
            path: "/",
          });

          // Reset login attempts
          const { error: resetAttemptsError } = await supabase
            .from("admins")
            .update({ login_attempts: 0, is_locked: false, locked_until: null })
            .eq("id", admin.id);
          if (resetAttemptsError) throw resetAttemptsError;

          // Record history
          const { error: successHistoryError } = await supabase
            .from("admin_login_histories")
            .insert({
              admin_id: admin.id,
              status: "SUCCESS",
              ip_address: ipAddress,
              user_agent: userAgent,
            });
          if (successHistoryError) throw successHistoryError;

          const { error: auditError } = await supabase
            .from("audit_logs")
            .insert({
              admin_id: admin.id,
              event: "LOGIN_SUCCESS",
              ip_address: ipAddress,
              device: `Trusted Device: ${activeTrust.device_name || userAgent}`,
              browser,
              os,
            });
          if (auditError) throw auditError;

          return {
            success: true,
            bypassOtp: true,
            email,
            message: "Sign in successful using trusted device.",
          };
        }
      } catch (error) {
        console.error("[Trusted Device Bypass Error]:", error);
      }
    }

    // Generate plain-text code
    const plainOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Deliver OTP via Resend first
    try {
      await sendOtpEmail({
        email,
        adminName: admin.name,
        otp: plainOtp,
        ipAddress,
        browser,
        os,
        loginTime: new Date().toLocaleString(),
      });
    } catch (emailError) {
      console.error("[Resend OTP Email Delivery Error]:", emailError);
      return {
        success: false,
        error: "Unable to send verification email. Please try again.",
      };
    }

    // Save OTP & Audit log only after successful email delivery
    try {
      const { error: otpInsertError } = await supabase
        .from("admin_otps")
        .insert({
          admin_id: admin.id,
          otp_hash: otpHash,
          expires_at: expiresAt,
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      if (otpInsertError) throw otpInsertError;

      const { error: otpLogError } = await supabase
        .from("audit_logs")
        .insert({
          admin_id: admin.id,
          event: "OTP_SENT",
          ip_address: ipAddress,
          device: userAgent,
          browser,
          os,
        });
      if (otpLogError) throw otpLogError;
    } catch (dbError) {
      console.error("[OTP DB Registration Error]:", dbError);
      return { success: false, error: "Database session error. Please try again." };
    }

    return {
      success: true,
      email,
      message: "Security verification code sent to your email.",
    };
  } catch (error) {
    console.error("[requestAdminOtpAction Catch Block]:", error);
    const errObj = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: `Authentication service error: ${errObj.message}`,
    };
  }
}

export async function verifyAdminOtpAction(
  emailInput: string,
  codeInput: string,
  trustDevice: boolean = false
) {
  const supabase = createAdminClient();

  try {
    const validated = verifySchema.safeParse({ email: emailInput, code: codeInput });
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid verification input." };
    }

    const { email, code } = validated.data;

    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || null;
    const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const { browser, os } = parseUserAgent(userAgent);

    const inputHash = hashOtp(code);

    // Get Admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (adminError) {
      console.error("[OTP Verification Admin Query Error]:", adminError);
      return { success: false, error: `Database fetch error: ${adminError.message}` };
    }

    if (!admin) {
      return { success: false, error: "Account verification mismatch." };
    }

    if (admin.is_locked && admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return { success: false, error: "Account is currently locked. Try again later." };
    }

    // Find active OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from("admin_otps")
      .select("*")
      .eq("admin_id", admin.id)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("[OTP Verification Active OTP Query Error]:", otpError);
      return { success: false, error: `Database error querying code: ${otpError.message}` };
    }

    if (!otpRecord) {
      return { success: false, error: "Verification code has expired or is invalid." };
    }

    if (otpRecord.attempts >= 5) {
      return { success: false, error: "Maximum verification attempts exceeded. Request a new code." };
    }

    if (otpRecord.otp_hash !== inputHash) {
      const newAttempts = otpRecord.attempts + 1;
      const newAdminAttempts = admin.login_attempts + 1;

      const shouldLock = newAdminAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      try {
        const { error: updateOtpErr } = await supabase
          .from("admin_otps")
          .update({ attempts: newAttempts })
          .eq("id", otpRecord.id);
        if (updateOtpErr) throw updateOtpErr;

        const { error: updateAdminErr } = await supabase
          .from("admins")
          .update({
            login_attempts: newAdminAttempts,
            is_locked: shouldLock,
            locked_until: lockedUntil,
          })
          .eq("id", admin.id);
        if (updateAdminErr) throw updateAdminErr;

        const { error: logErr } = await supabase
          .from("audit_logs")
          .insert({
            admin_id: admin.id,
            event: "OTP_FAILED",
            ip_address: ipAddress,
            device: userAgent,
            browser,
            os,
          });
        if (logErr) throw logErr;
      } catch (error) {
        console.error("[OTP Attempt Update Logging Error]:", error);
      }

      if (shouldLock) {
        return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
      }

      return { success: false, error: `Invalid verification code. ${5 - newAttempts} attempts remaining.` };
    }

    // Mark OTP as used
    const { error: useOtpError } = await supabase
      .from("admin_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);
    if (useOtpError) {
      console.error("[OTP Mark Used Query Error]:", useOtpError);
      throw useOtpError;
    }

    // Reset admin login attempts
    const { error: resetAdminError } = await supabase
      .from("admins")
      .update({ login_attempts: 0, is_locked: false, locked_until: null })
      .eq("id", admin.id);
    if (resetAdminError) {
      console.error("[Admin Lockout Reset Error]:", resetAdminError);
    }

    // Handle Trusted Device for 30 days
    if (trustDevice) {
      const rawDeviceToken = crypto.randomBytes(32).toString("hex");
      const hashedDeviceToken = crypto.createHash("sha256").update(rawDeviceToken).digest("hex");
      const deviceExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: deviceError } = await supabase
        .from("trusted_devices")
        .insert({
          admin_id: admin.id,
          device_token: hashedDeviceToken,
          device_name: `${browser} on ${os}`,
          expires_at: deviceExpires,
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      if (deviceError) {
        console.error("[Trusted Device Insertion Error]:", deviceError);
      } else {
        const cookieStore = await cookies();
        cookieStore.set("t2t_trusted_device", rawDeviceToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        admin_id: admin.id,
        session_token: hashedSessionToken,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (sessionError) {
      console.error("[Session Registration Error]:", sessionError);
      throw sessionError;
    }

    const cookieStore = await cookies();
    cookieStore.set("t2t_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 28800, // 8 hours
      path: "/",
    });

    // Record Login History & Audit Logs
    const { error: historyError } = await supabase
      .from("admin_login_histories")
      .insert({
        admin_id: admin.id,
        status: "SUCCESS",
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    if (historyError) console.error("[Success Login History Insertion Error]:", historyError);

    const { error: auditError } = await supabase
      .from("audit_logs")
      .insert({
        admin_id: admin.id,
        event: "LOGIN_SUCCESS",
        ip_address: ipAddress,
        device: userAgent,
        browser,
        os,
      });
    if (auditError) console.error("[Success Audit Log Insertion Error]:", auditError);

    return { success: true };
  } catch (error) {
    console.error("[verifyAdminOtpAction Catch Block]:", error);
    const errObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: `Verification failed: ${errObj.message}` };
  }
}

export async function resendOtpAction(email: string) {
  return requestAdminOtpAction(email);
}

export async function logoutAdminAction() {
  const supabase = createAdminClient();

  try {
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || null;
    const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const { browser, os } = parseUserAgent(userAgent);

    try {
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          event: "LOGOUT",
          ip_address: ipAddress,
          device: userAgent,
          browser,
          os,
        });
      if (auditError) throw auditError;
    } catch (logError) {
      console.error("[Logout Audit Log Error]:", logError);
    }

    const cookieStore = await cookies();
    cookieStore.delete("t2t_session");
    return { success: true };
  } catch (error) {
    console.error("[logoutAdminAction Error]:", error);
    return { success: false };
  }
}

export async function logoutAction() {
  return logoutAdminAction();
}
