"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { requestAdminOtpAction } from "../actions";
import Link from "next/link";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid administrator email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  rememberDevice: zod.boolean().optional(),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberDevice: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await requestAdminOtpAction(data.email, data.password);
      if (res.success) {
        if (res.bypassOtp) {
          toast.success("Welcome back! Signed in with trusted device.");
          router.push("/");
        } else {
          toast.success(res.message || "Verification code sent to your email!");
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        }
      } else {
        toast.error(res.error || "Invalid administrator credentials");
      }
    } catch (error) {
      toast.error("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
    // Keep focus after toggle
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);
  };

  const { ref: passwordRef, ...passwordRegister } = register("password");

  return (
    <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
      {/* Top Header & Branding */}
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
                Operations Center
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#6B7280]">
              Trash2Treasure Ecosystem
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-1">
          <h1 className="text-[26px] font-bold tracking-tight text-[#111827]">
            Sign in to Admin
          </h1>
          <p className="text-[14px] text-[#6B7280]">
            Access the Trash2Treasure Administration Portal
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[#374151]">
            Admin Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder=""
            className="h-[52px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-4 text-[14px] text-[#111827] focus:border-[#4F772D] focus:ring-2 focus:ring-[#4F772D]/20 focus:outline-none transition-colors"
          />
          {errors.email && (
            <p className="text-[12px] font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field with Eye/EyeOff Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#374151]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-[#4F772D] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative flex items-center w-full">
            <input
              {...passwordRegister}
              ref={(e) => {
                passwordRef(e);
                passwordInputRef.current = e;
              }}
              type={showPassword ? "text" : "password"}
              placeholder=""
              className="h-[52px] w-full rounded-[12px] border border-[#D1D5DB] bg-white pl-4 pr-12 text-[14px] text-[#111827] focus:border-[#4F772D] focus:ring-2 focus:ring-[#4F772D]/20 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  togglePasswordVisibility(e);
                }
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 flex h-[44px] w-[44px] items-center justify-center rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={18} className="transition-transform duration-150 active:scale-95" />
              ) : (
                <Eye size={18} className="transition-transform duration-150 active:scale-95" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] font-medium text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Device */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              {...register("rememberDevice")}
              type="checkbox"
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#4F772D] focus:ring-[#4F772D]"
            />
            <span className="text-[13px] font-medium text-[#4B5563]">
              Remember this device
            </span>
          </label>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#4F772D] px-4 text-[15px] font-semibold text-white shadow-xs hover:bg-[#5A8533] active:bg-[#436625] disabled:opacity-60 transition-colors cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
