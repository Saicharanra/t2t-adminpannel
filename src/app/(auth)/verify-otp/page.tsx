"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyOtpPage() {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-white">
            <Leaf size={20} />
          </div>
        </div>
        <h2 className="text-[30px] font-bold tracking-tight text-[#111827]">
          Verify code
        </h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed">
          We sent a 6-digit security code to <strong className="text-[#111827]">{email}</strong>. It will expire in {formatTime(timer)}.
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
              className="h-14 w-12 text-center text-xl font-bold rounded-lg border border-[#EAEAEA] bg-white focus:border-[#4F772D] focus:outline-none focus:ring-1 focus:ring-[#4F772D] transition-all"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#6B7280]">
            Didn&apos;t receive it?
          </span>
          <button
            type="button"
            onClick={handleResend}
            className="flex items-center gap-1 font-semibold text-[#4F772D] hover:underline"
          >
            <RefreshCw size={12} />
            Resend Code
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || attempts >= 5}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4F772D] text-sm font-semibold text-white shadow-sm hover:bg-[#066328] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Verify and login
              <CheckCircle2 size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
