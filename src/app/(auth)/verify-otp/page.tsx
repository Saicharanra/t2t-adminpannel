"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { verifyAdminOtpAction, requestAdminOtpAction } from "../actions";
import { maskEmail } from "@/lib/auth-crypto";
import { motion } from "framer-motion";
import Link from "next/link";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30); // 30 seconds resend cooldown
  const [trustDevice, setTrustDevice] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-minute expiry countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 30-second resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = Array(6).fill("");
      pastedData.split("").forEach((char, idx) => {
        newOtp[idx] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      triggerShake();
      return;
    }

    if (timer === 0) {
      toast.error("Verification code has expired. Please request a new code.");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await verifyAdminOtpAction(email, otpCode, trustDevice);
      if (res.success) {
        toast.success("Authentication verified cleanly!");
        router.push("/");
      } else {
        triggerShake();
        setAttempts((prev) => prev + 1);
        toast.error(res.error || "Invalid verification code.");
      }
    } catch (error) {
      triggerShake();
      toast.error("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setOtp(Array(6).fill(""));
    setTimer(300);
    setResendCooldown(30);

    const res = await requestAdminOtpAction(email);
    if (res.success) {
      toast.success(res.message || "New 6-digit code sent to your email!");
    } else {
      toast.error(res.error || "Failed to resend verification code.");
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-10 shadow-sm"
    >
      {/* Top Branding Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F772D] text-white shadow-xs">
            <Leaf size={24} className="fill-current" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold tracking-tight text-[#111827]">
                T2T Admin
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#F4F7F2] border border-[#A3B18A]/30 px-2 py-0.5 text-[10px] font-semibold text-[#4F772D] uppercase tracking-wider">
                <ShieldCheck size={12} />
                Security OTP
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#6B7280]">
              Two-Factor Authentication
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-1">
          <h1 className="text-[26px] font-bold tracking-tight text-[#111827]">
            Verify your email
          </h1>
          <p className="text-[14px] text-[#6B7280] leading-relaxed">
            We've sent a secure 6-digit verification code to{" "}
            <span className="font-semibold text-[#111827]">{maskEmail(email)}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Six Digit OTP Input Array */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              className="h-14 w-12 sm:w-14 rounded-xl border border-[#E5E7EB] bg-white text-center text-[22px] font-bold text-[#111827] focus:border-[#4F772D] focus:outline-none focus:ring-2 focus:ring-[#4F772D]/20 transition-all shadow-2xs"
            />
          ))}
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center justify-between text-[13px] border-y border-[#F3F4F6] py-3 text-[#6B7280]">
          <span>Code Expiry Status:</span>
          {timer > 0 ? (
            <span className="font-semibold text-[#4F772D]">
              Expires in {formatTimer(timer)}
            </span>
          ) : (
            <span className="font-semibold text-red-600">Code expired</span>
          )}
        </div>

        {/* Trust Device Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="h-4 w-4 rounded border-[#D1D5DB] text-[#4F772D] focus:ring-[#4F772D]"
          />
          <span className="text-[13px] font-medium text-[#374151]">
            Trust this device for 30 days
          </span>
        </label>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#4F772D] px-4 text-[15px] font-semibold text-white shadow-xs hover:bg-[#5A8533] active:bg-[#436625] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify & Sign In</span>
          )}
        </button>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 text-[13px]">
          <Link
            href="/login"
            className="flex items-center gap-1.5 font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Use another account</span>
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="flex items-center gap-1.5 font-medium text-[#4F772D] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            <RefreshCw size={13} className={resendCooldown > 0 ? "animate-spin" : ""} />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-[#6B7280]">
          Loading verification portal...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
