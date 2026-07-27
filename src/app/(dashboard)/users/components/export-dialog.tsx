import { X, Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
import { useState } from "react";
import { exportUsers, type UserFilters } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  filters: UserFilters;
  totalCount: number;
}

export function ExportDialog({ open, onClose, filters, totalCount }: ExportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await exportUsers(filters, format);
      
      // Convert to CSV (simple implementation)
      if (format === "csv") {
        const headers = ["Name", "Email", "Phone", "City", "Points", "Waste (kg)", "Status", "Joined"];
        const rows = data.map((user: any) => [
          user.name,
          user.email,
          user.phone || "",
          user.city || "",
          user.points,
          user.wasteSubmitted,
          user.status,
          new Date(user.joinedAt).toLocaleDateString(),
        ]);
        
        const csvContent = [
          headers.join(","),
          ...rows.map((row: any[]) => row.join(",")),
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${data.length} users to CSV`);
      } else {
        toast.info("Excel and PDF export coming soon");
      }
      
      onClose();
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[var(--t2t-text)]">
            Export Users
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--t2t-bg)] transition-colors"
          >
            <X size={18} className="text-[var(--t2t-text-secondary)]" />
          </button>
        </div>

        <p className="text-sm text-[var(--t2t-text-secondary)] mb-6">
          Export {totalCount} users with current filters applied
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setFormat("csv")}
            className={`flex w-full items-center gap-3 p-4 rounded-lg border transition-colors ${
              format === "csv"
                ? "border-[#14EF10] bg-[#14EF10]/10"
                : "border-[var(--t2t-border)] bg-[var(--t2t-bg)] hover:bg-[var(--t2t-surface-hover)]"
            }`}
          >
            <FileText size={20} className={format === "csv" ? "text-[#14EF10]" : "text-[var(--t2t-text-secondary)]"} />
            <div className="text-left">
              <div className="text-sm font-medium text-[var(--t2t-text)]">CSV</div>
              <div className="text-xs text-[var(--t2t-text-secondary)]">Comma-separated values</div>
            </div>
          </button>

          <button
            onClick={() => setFormat("excel")}
            disabled
            className={`flex w-full items-center gap-3 p-4 rounded-lg border transition-colors opacity-50 cursor-not-allowed ${
              format === "excel"
                ? "border-[#14EF10] bg-[#14EF10]/10"
                : "border-[var(--t2t-border)] bg-[var(--t2t-bg)]"
            }`}
          >
            <FileSpreadsheet size={20} className="text-[var(--t2t-text-secondary)]" />
            <div className="text-left">
              <div className="text-sm font-medium text-[var(--t2t-text)]">Excel</div>
              <div className="text-xs text-[var(--t2t-text-secondary)]">Coming soon</div>
            </div>
          </button>

          <button
            onClick={() => setFormat("pdf")}
            disabled
            className={`flex w-full items-center gap-3 p-4 rounded-lg border transition-colors opacity-50 cursor-not-allowed ${
              format === "pdf"
                ? "border-[#14EF10] bg-[#14EF10]/10"
                : "border-[var(--t2t-border)] bg-[var(--t2t-bg)]"
            }`}
          >
            <FileType size={20} className="text-[var(--t2t-text-secondary)]" />
            <div className="text-left">
              <div className="text-sm font-medium text-[var(--t2t-text)]">PDF</div>
              <div className="text-xs text-[var(--t2t-text-secondary)]">Coming soon</div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={format !== "csv"}
            loading={loading}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
