"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Lock, Loader2, ArrowLeft, CheckCircle, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase";
import { completePasswordResetAction } from "../actions";

const resetPasswordSchema = zod
  .object({
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = zod.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    // 1. Listen to Supabase Auth state or check active recovery session
    const checkRecoverySession = async () => {
      try {
        // Parse hash params if redirected with #access_token=...
        if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          const type = hashParams.get("type");

          if (accessToken && refreshToken && type === "recovery") {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && data?.user) {
              setUserEmail(data.user.email || null);
              setUserId(data.user.id);
              setIsSessionValid(true);
              return;
            }
          }
        }

        // Check active session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setUserEmail(sessionData.session.user.email || null);
          setUserId(sessionData.session.user.id);
          setIsSessionValid(true);
          return;
        }

        // Check URL search params for email fallback
        const searchParams = new URLSearchParams(window.location.search);
        const paramEmail = searchParams.get("email");
        if (paramEmail) {
          setUserEmail(paramEmail);
          setIsSessionValid(true);
          return;
        }

        // Allow entering password if user landed on this page from reset link
        setIsSessionValid(true);
      } catch (err) {
        console.error("[ResetPassword Session Check Error]:", err);
        setIsSessionValid(true);
      }
    };

    checkRecoverySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        if (session?.user) {
          setUserEmail(session.user.email || null);
          setUserId(session.user.id);
          setIsSessionValid(true);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculateStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    try {
      // First update via client Supabase Auth if session present
      try {
        await supabase.auth.updateUser({ password: data.password });
      } catch (e) {}

      // Execute server action for bcrypt update in public.admins
      const res = await completePasswordResetAction({
        newPassword: data.password,
        email: userEmail || undefined,
        userId: userId || undefined,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success(res.message || "Password updated successfully!");
      } else {
        toast.error(res.error || "Failed to update password.");
      }
    } catch (error) {
      console.error("[ResetPassword Submit Error]:", error);
      toast.error("An unexpected error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full rounded-2xl border border-white/10 bg-[#0A0A0C]/90 p-8 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Top Ambient Highlight Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#14EF10]/40 to-transparent" />

      {/* Top Branding Header */}
      <div className="flex flex-col items-center text-center">
        <div className="group relative flex items-center justify-center">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#14EF10]/30 to-[#4F772D]/30 blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D140C] border border-[#14EF10]/40 text-[#14EF10] shadow-inner">
            <ShieldCheck size={28} className="text-[#14EF10] drop-shadow-[0_0_8px_rgba(20,239,16,0.6)]" />
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <h1 className="text-[26px] font-extrabold tracking-tight text-white sm:text-[28px]">
            Set New Password
          </h1>
          <p className="mt-1.5 text-[13px] text-neutral-400 max-w-[320px] leading-relaxed">
            {userEmail
              ? `Create a secure new password for ${userEmail}`
              : "Enter your new administrator account password"}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="mt-7 rounded-xl border border-[#14EF10]/30 bg-[#14EF10]/5 p-6 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14EF10]/15 text-[#14EF10] border border-[#14EF10]/30 mx-auto">
            <CheckCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-white">
              Password Reset Complete!
            </h3>
            <p className="text-[13px] text-neutral-400 leading-relaxed max-w-[300px] mx-auto">
              Your administrator credentials have been updated securely. You can now sign in using your new password.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="group relative flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14EF10] via-[#10d00d] to-[#059669] text-[14px] font-bold text-black shadow-[0_0_20px_rgba(20,239,16,0.35)] hover:shadow-[0_0_28px_rgba(20,239,16,0.5)] transition-all cursor-pointer mt-4"
          >
            <span>Proceed to Sign In</span>
          </button>
        </div>
      ) : isSessionValid === false ? (
        <div className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400 mx-auto">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-white">
              Session Expired or Invalid
            </h3>
            <p className="text-[13px] text-neutral-400 leading-relaxed max-w-[300px] mx-auto">
              This password reset link is invalid or has expired. Please request a new recovery link.
            </p>
          </div>
          <button
            onClick={() => router.push("/forgot-password")}
            className="inline-flex items-center justify-center gap-2 text-[13px] font-bold text-[#14EF10] hover:underline pt-2"
          >
            <ArrowLeft size={16} />
            <span>Request New Reset Link</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-neutral-300">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••••••"
                className="h-[48px] w-full rounded-xl border border-white/10 bg-[#121216] pl-10 pr-10 text-[14px] text-white placeholder:text-neutral-600 focus:border-[#14EF10] focus:ring-2 focus:ring-[#14EF10]/20 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px] font-medium text-red-400 pl-1">{errors.password.message}</p>
            )}

            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="space-y-1.5 pt-1">
                <div className="flex h-1.5 w-full gap-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore >= 1 ? (strengthScore >= 3 ? "bg-[#14EF10]" : "bg-amber-400") : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(strengthScore * 20, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Strength:{" "}
                  <span className="font-semibold text-white">
                    {strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-neutral-300">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••••••"
                className="h-[48px] w-full rounded-xl border border-white/10 bg-[#121216] pl-10 pr-10 text-[14px] text-white placeholder:text-neutral-600 focus:border-[#14EF10] focus:ring-2 focus:ring-[#14EF10]/20 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[12px] font-medium text-red-400 pl-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14EF10] via-[#10d00d] to-[#059669] px-4 text-[14px] font-bold text-black shadow-[0_0_20px_rgba(20,239,16,0.35)] hover:shadow-[0_0_28px_rgba(20,239,16,0.5)] active:scale-[0.99] disabled:opacity-60 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-black" />
              ) : (
                <span>Update Password & Save</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Cancel and back to sign in</span>
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
