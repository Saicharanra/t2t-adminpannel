"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, CircleNotch, ArrowClockwise, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "admin@t2t.com";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const pasteArray = pasteData.split("");
      setOtp(pasteArray);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    if (timer === 0) {
      toast.error("Verification code has expired. Please request a new one.");
      return;
    }

    if (attempts >= 5) {
      toast.error("Too many failed attempts. Code locked.");
      return;
    }

    setLoading(true);
    try {
      // Mock code logic
      if (otpCode === "123456") {
        toast.success("Security verification successful!");
        // Set secure session cookie
        document.cookie = "t2t_session=authenticated-session-token; path=/; max-age=28800; SameSite=Lax";
        router.push("/");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          toast.error("Maximum attempts reached. Please request a new OTP.");
        } else {
          toast.error(`Invalid verification code. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      toast.error("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(Array(6).fill(""));
    setTimer(300);
    setAttempts(0);
    toast.success("New verification code sent to your email!");
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left space-y-2">
        <div className="flex justify-center sm:justify-start">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#111111] border border-[#222222] text-white">
            <Leaf size={18} weight="bold" />
          </div>
        </div>
        <h2 className="text-[24px] font-bold tracking-tight text-white">
          Verify code
        </h2>
        <p className="text-[13px] text-neutral-500 leading-relaxed">
          We sent a 6-digit security code to <strong className="text-neutral-300">{email}</strong>. It will expire in {formatTime(timer)}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="h-10 w-10 text-center text-lg font-bold rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white focus:border-[#14EF10] focus:outline-none transition-all"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <span className="text-neutral-500">
            Didn&apos;t receive it?
          </span>
          <button
            type="button"
            onClick={handleResend}
            className="flex items-center gap-1 font-semibold text-[#14EF10] hover:text-[#10d00d] hover:underline"
          >
            <ArrowClockwise size={12} />
            Resend Code
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || attempts >= 5}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded bg-[#fefefe] text-xs font-semibold text-black shadow-sm hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <CircleNotch size={14} className="animate-spin text-black" />
          ) : (
            <>
              Verify and login
              <CheckCircle size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-12">
          <CircleNotch size={24} className="animate-spin text-[#14EF10]" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
