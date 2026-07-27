"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Leaf, EnvelopeSimple, CircleNotch, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
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
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#111111] border border-[#222222] text-white">
            <Leaf size={18} weight="bold" />
          </div>
        </div>
        <h2 className="text-[24px] font-bold tracking-tight text-white">
          Reset password
        </h2>
        <p className="text-[13px] text-neutral-500">
          Enter your administrator email to receive reset instructions
        </p>
      </div>

      {submitted ? (
        <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-5 text-center sm:text-left space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14EF10]/10 text-[#14EF10] border border-[#14EF10]/25 mx-auto sm:mx-0">
            <CheckCircle size={18} />
          </div>
          <h3 className="text-[14px] font-semibold text-white">
            Check your email
          </h3>
          <p className="text-[12px] text-neutral-400 leading-relaxed">
            If an administrator account exists for that email address, we have sent instructions to reset your password.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#14EF10] hover:text-[#10d00d] hover:underline mx-auto sm:mx-0"
          >
            <ArrowLeft size={14} />
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className="h-9 w-full rounded border border-[#1a1a1a] bg-[#0a0a0a] pl-9 pr-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#14EF10] focus:outline-none transition-all"
                placeholder="name@t2t.com"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded bg-[#fefefe] text-xs font-semibold text-black shadow-sm hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <CircleNotch size={14} className="animate-spin text-black" />
              ) : (
                "Send reset instructions"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded border border-[#1a1a1a] bg-transparent text-xs font-semibold text-white shadow-sm hover:bg-[#121212] transition-colors"
            >
              <ArrowLeft size={14} />
              Cancel and back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
