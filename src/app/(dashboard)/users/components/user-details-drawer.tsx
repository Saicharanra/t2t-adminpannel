"use client";

import { X, Mail, Phone, MapPin, Calendar, Coins, Trash as TrashIcon, Award, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserById, updateUser } from "../actions";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface UserDetailsDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function UserDetailsDrawer({ userId, open, onClose, onRefresh }: UserDetailsDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (open && userId) {
      loadUser();
    }
  }, [userId, open]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch (error) {
      toast.error("Failed to load user details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl border-l border-[var(--t2t-border)] bg-[var(--t2t-bg)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-6 py-4">
          <h2 className="text-[20px] font-semibold text-[var(--t2t-text)]">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--t2t-bg)] transition-colors"
          >
            <X size={20} className="text-[var(--t2t-text-secondary)]" />
          </button>
        </div>

        {loading || !user ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#14EF10] border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* User Header */}
            <div className="bg-[var(--t2t-surface)] px-6 py-8 border-b border-[var(--t2t-border)]">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#14EF10]/10 text-[#14EF10] text-xl font-semibold">
                  {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-bold text-[var(--t2t-text)]">
                    {user.name}
                  </h3>
                  <p className="text-sm text-[var(--t2t-text-secondary)] mt-1">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      user.status === "Active" 
                        ? "text-[#14EF10] bg-[#14EF10]/10 border-[#14EF10]/20"
                        : "text-red-500 bg-red-500/10 border-red-500/20"
                    }`}>
                      {user.status}
                    </span>
                    <span className="text-xs text-[var(--t2t-text-secondary)]">
                      Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-[24px] font-bold text-[var(--t2t-text)]">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                    Eco Points
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[24px] font-bold text-[var(--t2t-text)]">
                    {user.wasteSubmitted.toFixed(1)}
                  </div>
                  <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                    Waste (kg)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[24px] font-bold text-[var(--t2t-text)]">
                    {user.carbonSaved.toFixed(1)}
                  </div>
                  <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                    CO₂ Saved (kg)
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--t2t-border)] bg-[var(--t2t-surface)]">
              <div className="flex gap-1 px-6">
                {["profile", "submissions", "redemptions", "tickets"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? "text-[#14EF10] border-[#14EF10]"
                        : "text-[var(--t2t-text-secondary)] border-transparent hover:text-[var(--t2t-text)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--t2t-text)] mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-[var(--t2t-text-secondary)]" />
                        <span className="text-sm text-[var(--t2t-text)]">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-[var(--t2t-text-secondary)]" />
                          <span className="text-sm text-[var(--t2t-text)]">{user.phone}</span>
                        </div>
                      )}
                      {user.city && (
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-[var(--t2t-text-secondary)]" />
                          <span className="text-sm text-[var(--t2t-text)]">{user.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[var(--t2t-text)] mb-3">
                      Activity Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-[var(--t2t-text-secondary)]">Total Submissions</span>
                        <span className="text-sm font-medium text-[var(--t2t-text)]">
                          {user._count.submissions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-[var(--t2t-text-secondary)]">Rewards Redeemed</span>
                        <span className="text-sm font-medium text-[var(--t2t-text)]">
                          {user._count.redemptions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-[var(--t2t-text-secondary)]">Support Tickets</span>
                        <span className="text-sm font-medium text-[var(--t2t-text)]">
                          {user._count.tickets}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="space-y-3">
                  {user.submissions.length === 0 ? (
                    <p className="text-sm text-[var(--t2t-text-secondary)] text-center py-8">
                      No waste submissions yet
                    </p>
                  ) : (
                    user.submissions.map((submission: any) => (
                      <div
                        key={submission.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)]"
                      >
                        <div>
                          <div className="text-sm font-medium text-[var(--t2t-text)]">
                            {submission.category}
                          </div>
                          <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                            {submission.weight}kg • {submission.location}
                          </div>
                          <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                            {format(new Date(submission.createdAt), "PPp")}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          submission.status === "Approved"
                            ? "bg-[#14EF10]/10 text-[#14EF10]"
                            : "bg-[var(--t2t-surface)] text-[var(--t2t-text-secondary)]"
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "redemptions" && (
                <div className="space-y-3">
                  {user.redemptions.length === 0 ? (
                    <p className="text-sm text-[var(--t2t-text-secondary)] text-center py-8">
                      No rewards redeemed yet
                    </p>
                  ) : (
                    user.redemptions.map((redemption: any) => (
                      <div
                        key={redemption.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)]"
                      >
                        <div>
                          <div className="text-sm font-medium text-[var(--t2t-text)]">
                            {redemption.reward.title}
                          </div>
                          <div className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                            {format(new Date(redemption.createdAt), "PPp")}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          redemption.status === "Approved"
                            ? "bg-[#14EF10]/10 text-[#14EF10]"
                            : "bg-[var(--t2t-surface)] text-[var(--t2t-text-secondary)]"
                        }`}>
                          {redemption.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="space-y-3">
                  {user.tickets.length === 0 ? (
                    <p className="text-sm text-[var(--t2t-text-secondary)] text-center py-8">
                      No support tickets
                    </p>
                  ) : (
                    user.tickets.map((ticket: any) => (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)]"
                      >
                        <div className="text-sm font-medium text-[var(--t2t-text)]">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-[var(--t2t-text-secondary)] mt-1 line-clamp-2">
                          {ticket.message}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === "Resolved"
                              ? "bg-[#14EF10]/10 text-[#14EF10]"
                              : "bg-[var(--t2t-surface)] text-[var(--t2t-text-secondary)]"
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-xs text-[var(--t2t-text-secondary)]">
                            {ticket.priority} priority
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
