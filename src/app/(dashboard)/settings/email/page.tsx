"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Terminal, 
  RefreshCw, 
  Lock,
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getEmailSettings } from "./actions";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EmailSettingsPage() {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState({
    resendConfigured: false,
    emailFrom: "",
  });

  // Test Email States
  const [testTo, setTestTo] = useState("");
  const [testSubject, setTestSubject] = useState("T2T Test Email");
  const [testHtml, setTestHtml] = useState("<p>This is a test email sent from the Trash2Treasure Admin Panel.</p>");
  const [sendingEmail, setSendingEmail] = useState(false);

  // OTP Sandbox States
  const [otpEmail, setOtpEmail] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    getEmailSettings()
      .then((res) => {
        setConfig(res);
      })
      .catch((err) => {
        console.error("Failed to load email settings", err);
        toast.error("Could not load email configurations.");
      })
      .finally(() => {
        setLoadingConfig(false);
      });
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo) {
      toast.error("Recipient email is required.");
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testTo,
          subject: testSubject,
          html: testHtml,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          config.resendConfigured 
            ? "Test email sent successfully via Resend!" 
            : "Email simulated! Check server terminal logs."
        );
      } else {
        toast.error(data.error || "Failed to send test email.");
      }
    } catch (err) {
      toast.error("An error occurred. Please check console.");
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error("Email is required for OTP.");
      return;
    }

    setRequestingOtp(true);
    setOtpMessage(null);
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        toast.success(
          config.resendConfigured
            ? "Verification OTP sent to your email!"
            : "OTP generated! Check terminal console logs."
        );
      } else {
        toast.error(data.error || "Failed to generate OTP.");
      }
    } catch (err) {
      toast.error("An error occurred during OTP generation.");
      console.error(err);
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          code: otpCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpMessage({ success: true, text: "Verification successful! The OTP is valid." });
        toast.success("OTP verified successfully!");
      } else {
        setOtpMessage({ success: false, text: data.error || "Verification failed." });
        toast.error(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      toast.error("An error occurred during verification.");
      console.error(err);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <div className="flex flex-col gap-3">
        <Link 
          href="/settings"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--t2t-text-secondary)] hover:text-[var(--t2t-primary)] transition-colors self-start"
        >
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <PageHeader 
          title="Email Integrations & APIs" 
          description="Configure Resend, dispatch transactional emails, and simulate OTP authentication." 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Connection Status Card */}
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[var(--t2t-text)]">Resend Provider Status</h2>
                  {loadingConfig ? (
                    <RefreshCw size={14} className="animate-spin text-[var(--t2t-text-muted)]" />
                  ) : config.resendConfigured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Active (Live)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500 border border-amber-500/20">
                      <AlertTriangle size={12} /> Simulator Mode (Dev)
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--t2t-text-secondary)]">
                  Manage configuration settings for email delivery services.
                </p>
              </div>

              {!loadingConfig && !config.resendConfigured && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-amber-500 text-xs max-w-md">
                  <Terminal size={16} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Notice:</strong> Define <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> in your local <code>.env</code> file to enable live delivery to actual inboxes.
                  </p>
                </div>
              )}
            </div>

            <hr className="my-5 border-[var(--t2t-border)]" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <span className="text-xs text-[var(--t2t-text-muted)] uppercase tracking-wider font-semibold">Service Provider</span>
                <p className="text-sm font-semibold text-[var(--t2t-text)] flex items-center gap-2">
                  <Mail size={16} className="text-[var(--t2t-primary)]" /> Resend SMTP/API Client
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-[var(--t2t-text-muted)] uppercase tracking-wider font-semibold">Sender Identity</span>
                <p className="text-sm font-semibold text-[var(--t2t-text)] truncate">
                  {loadingConfig ? "Checking..." : config.emailFrom}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-[var(--t2t-text-muted)] uppercase tracking-wider font-semibold">Auth Protocol</span>
                <p className="text-sm font-semibold text-[var(--t2t-text)] flex items-center gap-2">
                  <Lock size={16} className="text-[var(--t2t-primary)]" /> AES-256 OTP Hashes (Database)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Email Dispatcher */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)] flex flex-col h-full">
            <div className="mb-5">
              <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
                <Send size={18} className="text-[var(--t2t-primary)]" /> Mail Dispatcher
              </h3>
              <p className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                Send a raw transactional email via `/api/email/send`.
              </p>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--t2t-text-secondary)]">Recipient Address</label>
                <input 
                  type="email" 
                  placeholder="admin@test.com" 
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)] text-sm text-[var(--t2t-text)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--t2t-text-secondary)]">Subject</label>
                <input 
                  type="text" 
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)] text-sm text-[var(--t2t-text)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-[var(--t2t-text-secondary)]">HTML Body</label>
                <textarea 
                  value={testHtml}
                  onChange={(e) => setTestHtml(e.target.value)}
                  className="w-full flex-1 min-h-[120px] p-3 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)] text-sm font-mono text-[var(--t2t-text)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full h-9 rounded bg-[var(--t2t-primary)] text-black hover:bg-[var(--t2t-primary)]/80 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all mt-4"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Email
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* OTP Sandbox */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)] h-full flex flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
                  <Smartphone size={18} className="text-[var(--t2t-primary)]" /> OTP Verification Sandbox
                </h3>
                <p className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                  Request and verify one-time passwords through `/api/otp/send` and `/api/otp/verify`.
                </p>
              </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
              
              {/* Step 1: Send OTP */}
              <div className="p-5 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--t2t-primary-subtle)] text-xs font-bold text-[var(--t2t-primary)]">
                    1
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--t2t-text)]">Request OTP Code</h4>
                </div>

                <form onSubmit={handleSendOtp} className="flex flex-col md:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter recipient email address..." 
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    disabled={otpSent && requestingOtp}
                    className="flex-1 h-9 px-3 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-sm text-[var(--t2t-text)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={requestingOtp}
                    className="h-9 px-4 rounded bg-[var(--t2t-primary)] text-black hover:bg-[var(--t2t-primary)]/80 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                  >
                    {requestingOtp ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Requesting...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} /> {otpSent ? "Resend Code" : "Request Code"}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Step 2: Verify OTP */}
              <div className={`p-5 rounded-xl border transition-all ${otpSent ? "border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]" : "border-[var(--t2t-border)]/40 bg-[var(--t2t-surface-hover)]/20 opacity-50"}`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--t2t-primary-subtle)] text-xs font-bold text-[var(--t2t-primary)]">
                    2
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--t2t-text)]">Verify OTP Code</h4>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col md:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit verification code..." 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                    disabled={!otpSent || verifyingOtp}
                    className="flex-1 h-9 px-3 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-sm text-[var(--t2t-text)] font-mono tracking-wider focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!otpSent || verifyingOtp}
                    className="h-9 px-5 rounded bg-white text-black hover:bg-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    {verifyingOtp ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Confirm Code"
                    )}
                  </button>
                </form>

                {/* Verification Feedback Banner */}
                {otpMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg border text-xs flex items-start gap-2.5 ${otpMessage.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                  >
                    {otpMessage.success ? (
                      <CheckCircle2 size={16} className="shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="shrink-0" />
                    )}
                    <div>
                      <strong>{otpMessage.success ? "Success" : "Error"}:</strong> {otpMessage.text}
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
