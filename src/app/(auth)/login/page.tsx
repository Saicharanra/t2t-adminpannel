"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { 
  Leaf, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { requestAdminOtpAction } from "../actions";
import Link from "next/link";
import { motion } from "framer-motion";

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
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);
  };

  const { ref: passwordRef, ...passwordRegister } = register("password");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full rounded-2xl border border-white/10 bg-[#0A0A0C]/90 p-8 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Top Ambient Highlight Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#14EF10]/40 to-transparent" />

      {/* Top Header & Branding */}
      <div className="flex flex-col items-center text-center">
        {/* Logo Badge */}
        <div className="group relative flex items-center justify-center">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#14EF10]/30 to-[#4F772D]/30 blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D140C] border border-[#14EF10]/40 text-[#14EF10] shadow-inner">
            <Leaf size={28} className="fill-current text-[#14EF10] drop-shadow-[0_0_8px_rgba(20,239,16,0.6)]" />
          </div>
        </div>

        {/* Title & Status */}
        <div className="mt-5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#14EF10]/10 border border-[#14EF10]/30 px-3 py-1 text-[11px] font-semibold text-[#14EF10] tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14EF10] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14EF10]"></span>
            </span>
            <ShieldCheck size={13} />
            <span>Operations Portal</span>
          </div>

          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-white sm:text-[28px]">
            Sign in to Admin
          </h1>
          <p className="mt-1.5 text-[13px] text-neutral-400 max-w-[320px] leading-relaxed">
            Trash2Treasure Ecosystem Governance & Operations Management
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-300">
            Admin Email Address
          </label>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
            <input
              {...register("email")}
              type="email"
              autoComplete="username"
              placeholder="admin@t2t.com"
              className="h-[48px] w-full rounded-xl border border-white/10 bg-[#121216] pl-10 pr-4 text-[14px] text-white placeholder:text-neutral-600 focus:border-[#14EF10] focus:ring-2 focus:ring-[#14EF10]/20 focus:outline-none transition-all duration-200"
            />
          </div>
          {errors.email && (
            <p className="text-[12px] font-medium text-red-400 pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-neutral-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-[#14EF10] hover:text-[#10d00d] hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center w-full">
            <Lock size={18} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
            <input
              {...passwordRegister}
              ref={(e) => {
                passwordRef(e);
                passwordInputRef.current = e;
              }}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="h-[48px] w-full rounded-xl border border-white/10 bg-[#121216] pl-10 pr-11 text-[14px] text-white placeholder:text-neutral-600 focus:border-[#14EF10] focus:ring-2 focus:ring-[#14EF10]/20 focus:outline-none transition-all duration-200"
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
              className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
            >
              {showPassword ? (
                <EyeOff size={16} className="transition-transform duration-150 active:scale-95" />
              ) : (
                <Eye size={16} className="transition-transform duration-150 active:scale-95" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] font-medium text-red-400 pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Device & Security */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              {...register("rememberDevice")}
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-[#121216] text-[#14EF10] focus:ring-[#14EF10] focus:ring-offset-0 cursor-pointer accent-[#14EF10]"
            />
            <span className="text-[13px] text-neutral-400 group-hover:text-neutral-200 transition-colors">
              Remember this device
            </span>
          </label>

          <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#14EF10]" /> SSL Secure
          </span>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14EF10] via-[#10d00d] to-[#059669] px-4 text-[14px] font-bold text-black shadow-[0_0_20px_rgba(20,239,16,0.35)] hover:shadow-[0_0_28px_rgba(20,239,16,0.5)] active:scale-[0.99] disabled:opacity-60 transition-all duration-200 cursor-pointer mt-3"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin text-black" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-8 border-t border-white/5 pt-5 text-center">
        <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-[#14EF10]" />
          Authorized administrator personnel only
        </p>
      </div>
    </motion.div>
  );
}
