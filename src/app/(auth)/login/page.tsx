"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, Lock, EnvelopeSimple, CircleNotch, ArrowRight } from "@phosphor-icons/react";
import { toast } from "sonner";

const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      // Mock logic for demo/verification flow
      if (data.email === "admin@t2t.com" && data.password === "Password123!") {
        toast.success("Credentials validated! Redirecting to OTP verification...");
        // Redirect to verification code page with email parameter
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error("Invalid administrator credentials");
      }
    } catch (error) {
      toast.error("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
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
          Welcome back
        </h2>
        <p className="text-[13px] text-neutral-500">
          Sign in to the Trash2Treasure administration center
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-neutral-300">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeSimple
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="email"
              {...register("email")}
              className="h-9 w-full rounded border border-[#1a1a1a] bg-[#0a0a0a] pl-9 pr-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#f38020] focus:outline-none transition-all"
              placeholder="name@t2t.com"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-neutral-300">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-[12px] font-medium text-[#5CE65C] hover:text-[#4cd14c] hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="password"
              {...register("password")}
              className="h-9 w-full rounded border border-[#1a1a1a] bg-[#0a0a0a] pl-9 pr-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#5CE65C] focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded bg-[#fefefe] text-xs font-semibold text-black shadow-sm hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <CircleNotch size={14} className="animate-spin text-black" />
          ) : (
            <>
              Continue
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
