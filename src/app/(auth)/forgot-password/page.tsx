"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const forgotPasswordSchema = zod.object({
  email: zod.string().email("Invalid email address"),
});

type ForgotPasswordValues = zod.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      // Mock logic
      setSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      toast.error("Failed to process request");
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
          Reset password
        </h2>
        <p className="text-[14px] text-[#6B7280]">
          Enter your administrator email to receive reset instructions
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-[#E8F5E0] bg-[#FAFAFA] p-5 text-center sm:text-left space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A] mx-auto sm:mx-0">
            <CheckCircle2 size={18} />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">
            Check your email
          </h3>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">
            If an administrator account exists for that email address, we have sent instructions to reset your password.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4F772D] hover:underline mx-auto sm:mx-0"
          >
            <ArrowLeft size={14} />
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4F772D] text-sm font-semibold text-white shadow-sm hover:bg-[#066328] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Send reset instructions"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#EAEAEA] bg-white text-sm font-semibold text-[#111827] shadow-sm hover:bg-[#FAFAFA] transition-colors"
            >
              <ArrowLeft size={16} />
              Cancel and back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
