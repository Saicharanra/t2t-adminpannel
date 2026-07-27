import { FileText, Download, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export platform reports">
        <Button variant="default" className="flex items-center gap-2">
          <FileText size={15} />
          Generate Report
        </Button>
      </PageHeader>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Weekly Summary",
            description: "Key metrics and activity for the past week",
            icon: <Calendar size={20} />,
          },
          {
            title: "Monthly Report",
            description: "Comprehensive monthly performance analysis",
            icon: <FileText size={20} />,
          },
          {
            title: "Environmental Impact",
            description: "CO₂ savings, waste diverted, and sustainability metrics",
            icon: <FileText size={20} />,
          },
          {
            title: "Fraud Detection",
            description: "Suspicious activity and flagged submissions",
            icon: <FileText size={20} />,
          },
          {
            title: "Business Report",
            description: "Partner performance and revenue breakdown",
            icon: <FileText size={20} />,
          },
          {
            title: "Custom Report",
            description: "Build a report with custom parameters and date ranges",
            icon: <FileText size={20} />,
          },
        ].map((report) => (
          <div
            key={report.title}
            className="group cursor-pointer rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)] hover:border-[var(--t2t-primary)]/30 hover:shadow-[var(--t2t-shadow-md)] transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)]">
              {report.icon}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--t2t-text)]">
              {report.title}
            </h3>
            <p className="mt-1 text-[13px] text-[var(--t2t-text-secondary)]">
              {report.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-[var(--t2t-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
                <Download size={12} />
                PDF
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-[var(--t2t-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
                <Download size={12} />
                Excel
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-[var(--t2t-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
                <Download size={12} />
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report History */}
      <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)]">
        <h3 className="text-sm font-semibold text-[var(--t2t-text)]">
          Report History
        </h3>
        <p className="text-[12px] text-[var(--t2t-text-muted)]">
          Previously generated reports
        </p>
        <div className="mt-4">
          <EmptyState
            icon={<FileText size={24} />}
            title="No reports generated"
            description="Generated reports will appear here for download and reference."
            className="border-0 bg-transparent py-8"
          />
        </div>
      </div>
    </div>
  );
}
