"use client";

import { Eye, Edit, Ban, CheckCircle, Trash2, Mail, Coins, Key } from "lucide-react";
import { useState } from "react";
import { updateUser, deleteUser, adjustUserPoints } from "../actions";
import { toast } from "sonner";

interface UserActionsMenuProps {
  user: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function UserActionsMenu({ user, onClose, onRefresh }: UserActionsMenuProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] shadow-lg z-50">
      <div className="py-1">
        <button
          onClick={() => handleAction(
            () => updateUser(user.id, { status: user.status === "Active" ? "Suspended" : "Active" }),
            user.status === "Active" ? "User suspended" : "User activated"
          )}
          disabled={loading}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
        >
          {user.status === "Active" ? (
            <>
              <Ban size={14} />
              Suspend User
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Activate User
            </>
          )}
        </button>

        <button
          onClick={() => {
            const points = prompt("Enter points to add:");
            if (points) {
              handleAction(
                () => adjustUserPoints(user.id, parseInt(points), "add"),
                "Points added successfully"
              );
            }
          }}
          disabled={loading}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
        >
          <Coins size={14} />
          Add Points
        </button>

        <button
          onClick={() => {
            toast.info("Email feature coming soon");
          }}
          disabled={loading}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
        >
          <Mail size={14} />
          Send Email
        </button>

        <button
          onClick={() => {
            toast.info("Reset password feature coming soon");
          }}
          disabled={loading}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
        >
          <Key size={14} />
          Reset Password
        </button>

        <hr className="my-1 border-[var(--t2t-border)]" />

        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
              handleAction(
                () => deleteUser(user.id),
                "User deleted successfully"
              );
            }
          }}
          disabled={loading}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} />
          Delete User
        </button>
      </div>
    </div>
  );
}
