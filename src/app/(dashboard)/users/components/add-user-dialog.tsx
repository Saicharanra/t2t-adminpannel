"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createUser } from "../actions";
import { toast } from "sonner";

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserDialog({ open, onClose, onSuccess }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    status: "Active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData);
      toast.success("User created successfully");
      onSuccess();
      onClose();
      setFormData({ name: "", email: "", phone: "", city: "", status: "Active" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[var(--t2t-text)]">
            Add New User
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--t2t-bg)] transition-colors"
          >
            <X size={18} className="text-[var(--t2t-text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--t2t-text)] mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10]"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--t2t-text)] mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10]"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--t2t-text)] mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10]"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--t2t-text)] mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10]"
              placeholder="City name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--t2t-text)] mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-sm font-medium text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#14EF10] text-sm font-medium text-black hover:bg-[#10d00d] disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
