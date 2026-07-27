"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-white">
            <Leaf size={20} />
          </div>
        </div>
        <h2 className="text-[30px] font-bold tracking-tight text-[#111827]">
          Welcome back
        </h2>
        <p className="text-[14px] text-[#6B7280]">
          Sign in to the Trash2Treasure administration center
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[#111827]">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="email"
              {...register("email")}
              className="h-11 w-full rounded-lg border border-[#EAEAEA] bg-white pl-10 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#4F772D] focus:outline-none focus:ring-1 focus:ring-[#4F772D] transition-all"
              placeholder="name@t2t.com"
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-[#DC2626]">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#111827]">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-[13px] font-medium text-[#4F772D] hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="password"
              {...register("password")}
              className="h-11 w-full rounded-lg border border-[#EAEAEA] bg-white pl-10 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#4F772D] focus:outline-none focus:ring-1 focus:ring-[#4F772D] transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-[12px] text-[#DC2626]">{errors.password.message}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4F772D] text-sm font-semibold text-white shadow-sm hover:bg-[#066328] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
