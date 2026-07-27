"use server";

import { prisma } from "@/lib/prisma";
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
async function checkRateLimit(ipAddress: string, email: string): Promise<{ allowed: boolean; error?: string }> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 1000 * 60);

  try {
    // 1. IP rate limiting (max 10 actions per minute from same IP)
    const ipActions = await prisma.auditLog.count({
      where: {
        ipAddress,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (ipActions > 10) {
      return { allowed: false, error: "Rate limit exceeded. Too many requests from this IP. Please wait 1 minute." };
    }

    // 2. Resend rate limiting (max 3 OTP requests per email in 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 1000 * 60);
    const emailOtps = await prisma.adminOTP.count({
      where: {
        admin: { email },
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (emailOtps >= 3) {
      return { allowed: false, error: "Verification code requested too frequently. Please wait a few minutes." };
    }
  } catch (error) {
    console.error("[Rate Limit DB Check Error]:", error);
  }

  return { allowed: true };
}

export async function requestAdminOtpAction(emailInput: string, passwordInput?: string) {
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

    // Apply Rate Limiting
    const rateCheck = await checkRateLimit(ipAddress, email);
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    // Auto-seed default admin ONLY if database has 0 admins
    try {
      const adminCount = await prisma.admin.count();
      if (adminCount === 0) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash("Password123!", salt);
        await prisma.admin.create({
          data: {
            email: "admin@t2t.com",
            name: "Super Admin",
            password: hashedPassword,
            role: "Super Admin",
          },
        });
      }
    } catch (e) {
      console.error("[DB Admin Auto-Seed Error]:", e);
    }

    let admin = null;
    try {
      admin = await prisma.admin.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error("[Admin Find Query Error]:", error);
      return { success: false, error: "Database service unavailable. Please try again." };
    }

    if (!admin) {
      return { success: false, error: "Administrator account not found." };
    }

    // Lockout verification
    if (admin.isLocked && admin.lockedUntil) {
      if (new Date(admin.lockedUntil) > new Date()) {
        const minutesLeft = Math.ceil(
          (new Date(admin.lockedUntil).getTime() - Date.now()) / (60 * 1000)
        );
        return {
          success: false,
          error: `Account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
        };
      } else {
        // Lockout expired, reset status
        try {
          await prisma.admin.update({
            where: { id: admin.id },
            data: { isLocked: false, lockedUntil: null, loginAttempts: 0 },
          });
        } catch (error) {
          console.error("[Unlock Admin Update Error]:", error);
        }
      }
    }

    // Credentials check using async bcrypt.compare
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      const newAttempts = admin.loginAttempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      try {
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            loginAttempts: newAttempts,
            isLocked: shouldLock,
            lockedUntil,
          },
        });

        await prisma.adminLoginHistory.create({
          data: {
            adminId: admin.id,
            status: "FAILURE",
            ipAddress,
            userAgent,
          },
        });

        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            event: "LOGIN_FAILURE",
            ipAddress,
            device: userAgent,
            browser,
            os,
          },
        });
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
        const activeTrust = await prisma.trustedDevice.findFirst({
          where: {
            adminId: admin.id,
            deviceToken: hashedToken,
            expiresAt: { gte: new Date() },
          },
        });

        if (activeTrust) {
          // Create cryptographically secure session
          const sessionToken = crypto.randomUUID();
          const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
          const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

          await prisma.adminSession.create({
            data: {
              adminId: admin.id,
              sessionToken: hashedSessionToken,
              expiresAt,
              ipAddress,
              userAgent,
            },
          });

          cookieStore.set("t2t_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 28800, // 8 hours
            path: "/",
          });

          // Reset admin login attempts
          await prisma.admin.update({
            where: { id: admin.id },
            data: { loginAttempts: 0, isLocked: false, lockedUntil: null },
          });

          // Record Login History & Audit Logs
          await prisma.adminLoginHistory.create({
            data: {
              adminId: admin.id,
              status: "SUCCESS",
              ipAddress,
              userAgent,
            },
          });

          await prisma.auditLog.create({
            data: {
              adminId: admin.id,
              event: "LOGIN_SUCCESS",
              ipAddress,
              device: `Trusted Device: ${activeTrust.deviceName || userAgent}`,
              browser,
              os,
            },
          });

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

    // Generate secure cryptographically random 6-digit OTP
    const plainOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Deliver OTP via Resend first
    try {
      await sendOtpEmail(email, plainOtp);
    } catch (emailError) {
      console.error("[Resend OTP Email Delivery Error]:", emailError);
      return {
        success: false,
        error: "Unable to send verification email. Please try again.",
      };
    }

    // Save hashed OTP & Audit log only after successful email delivery
    try {
      await prisma.adminOTP.create({
        data: {
          adminId: admin.id,
          otpHash,
          expiresAt,
          ipAddress,
          userAgent,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          event: "OTP_SENT",
          ipAddress,
          device: userAgent,
          browser,
          os,
        },
      });
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
    return {
      success: false,
      error: "Authentication service encountered an error. Please try again.",
    };
  }
}

export async function verifyAdminOtpAction(
  emailInput: string,
  codeInput: string,
  trustDevice: boolean = false
) {
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
    let admin = null;
    let otpRecord = null;

    try {
      admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        return { success: false, error: "Account verification mismatch." };
      }

      if (admin.isLocked && admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
        return { success: false, error: "Account is currently locked. Try again later." };
      }

      // Find active OTP record
      otpRecord = await prisma.adminOTP.findFirst({
        where: {
          adminId: admin.id,
          usedAt: null,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return { success: false, error: "Verification code has expired or is invalid." };
      }

      if (otpRecord.attempts >= 5) {
        return { success: false, error: "Maximum verification attempts exceeded. Request a new code." };
      }

      if (otpRecord.otpHash !== inputHash) {
        const newAttempts = otpRecord.attempts + 1;
        const newAdminAttempts = admin.loginAttempts + 1;

        const shouldLock = newAdminAttempts >= 5;
        const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

        await prisma.adminOTP.update({
          where: { id: otpRecord.id },
          data: { attempts: newAttempts },
        });

        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            loginAttempts: newAdminAttempts,
            isLocked: shouldLock,
            lockedUntil,
          },
        });

        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            event: "OTP_FAILED",
            ipAddress,
            device: userAgent,
            browser,
            os,
          },
        });

        if (shouldLock) {
          return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
        }

        return { success: false, error: `Invalid verification code. ${5 - newAttempts} attempts remaining.` };
      }

      // Mark OTP as used
      await prisma.adminOTP.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      });

      // Reset admin login attempts
      await prisma.admin.update({
        where: { id: admin.id },
        data: { loginAttempts: 0, isLocked: false, lockedUntil: null },
      });

      // Handle Trusted Device for 30 days (saving hashed token)
      if (trustDevice) {
        const rawDeviceToken = crypto.randomBytes(32).toString("hex");
        const hashedDeviceToken = crypto.createHash("sha256").update(rawDeviceToken).digest("hex");
        const deviceExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.trustedDevice.create({
          data: {
            adminId: admin.id,
            deviceToken: hashedDeviceToken,
            deviceName: `${browser} on ${os}`,
            expiresAt: deviceExpires,
            ipAddress,
            userAgent,
          },
        });

        const cookieStore = await cookies();
        cookieStore.set("t2t_trusted_device", rawDeviceToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }

      // Create secure session
      const sessionToken = crypto.randomUUID();
      const hashedSessionToken = crypto.createHash("sha256").update(sessionToken).digest("hex");
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

      await prisma.adminSession.create({
        data: {
          adminId: admin.id,
          sessionToken: hashedSessionToken,
          expiresAt,
          ipAddress,
          userAgent,
        },
      });

      const cookieStore = await cookies();
      cookieStore.set("t2t_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 28800, // 8 hours
        path: "/",
      });

      // Record Login History & Audit Logs
      await prisma.adminLoginHistory.create({
        data: {
          adminId: admin.id,
          status: "SUCCESS",
          ipAddress,
          userAgent,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          event: "LOGIN_SUCCESS",
          ipAddress,
          device: userAgent,
          browser,
          os,
        },
      });

      return { success: true };
    } catch (dbError) {
      console.error("[OTP Verification DB Execution Error]:", dbError);
      return { success: false, error: "Database error during verification. Please try again." };
    }
  } catch (error) {
    console.error("[verifyAdminOtpAction Catch Block]:", error);
    return { success: false, error: "An error occurred during verification." };
  }
}

export async function resendOtpAction(email: string) {
  return requestAdminOtpAction(email);
}

export async function logoutAdminAction() {
  try {
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || null;
    const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const { browser, os } = parseUserAgent(userAgent);

    try {
      await prisma.auditLog.create({
        data: {
          event: "LOGOUT",
          ipAddress,
          device: userAgent,
          browser,
          os,
        },
      });
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
