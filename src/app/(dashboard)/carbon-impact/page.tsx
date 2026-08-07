"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  Trees,
  Zap,
  Droplets,
  Car,
  Home,
  Smartphone,
  Download,
  RefreshCw,
  Award,
  BarChart3,
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Recycle,
  Factory
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getCarbonImpactMetrics, MaterialImpact, MonthlyImpactData, CarbonChampion } from "./actions";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function CarbonImpactPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalWeightKg: number;
    totalCo2SavedKg: number;
    totalCo2SavedTons: number;
    treesPlantedEquivalent: number;
    energySavedKwh: number;
    waterSavedLiters: number;
    landfillDivertedM3: number;
    equivalents: {
      carMilesAvoided: number;
      homeElectricityDays: number;
      smartphonesCharged: number;
    };
    materialBreakdown: MaterialImpact[];
    monthlyTrends: MonthlyImpactData[];
    topChampions: CarbonChampion[];
  }>({
    totalWeightKg: 0,
    totalCo2SavedKg: 0,
    totalCo2SavedTons: 0,
    treesPlantedEquivalent: 0,
    energySavedKwh: 0,
    waterSavedLiters: 0,
    landfillDivertedM3: 0,
    equivalents: { carMilesAvoided: 0, homeElectricityDays: 0, smartphonesCharged: 0 },
    materialBreakdown: [],
    monthlyTrends: [],
    topChampions: [],
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await getCarbonImpactMetrics();
      if (res.success) {
        setData(res);
      } else {
        toast.error(res.error || "Failed to load carbon impact metrics.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading carbon impact data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (data.totalCo2SavedKg === 0) {
      toast.error("No impact data available for export.");
      return;
    }

    const reportLines = [
      "TRASH2TREASURE — OFFICIAL CARBON IMPACT STATEMENT",
      `Generated Date: ${new Date().toLocaleString()}`,
      `Total Recyclable Waste Processed: ${data.totalWeightKg} KG`,
      `Total Net CO2 Prevented: ${data.totalCo2SavedKg} KG (${data.totalCo2SavedTons} Metric Tons)`,
      `Equivalent Trees Planted: ${data.treesPlantedEquivalent} Trees`,
      `Clean Energy Preserved: ${data.energySavedKwh} kWh`,
      `Water Preserved: ${data.waterSavedLiters} Liters`,
      `Landfill Space Diverted: ${data.landfillDivertedM3} m3`,
      `Car Miles Avoided: ${data.equivalents.carMilesAvoided} Miles`,
      `Home Electricity Days: ${data.equivalents.homeElectricityDays} Days`,
      `Smartphones Charged Equivalent: ${data.equivalents.smartphonesCharged} Charges`,
      "",
      "MATERIAL BREAKDOWN:",
      ...data.materialBreakdown.map(
        (m) => `${m.category}: ${m.weightKg} KG | Factor: ${m.co2Factor}x | CO2 Avoided: ${m.co2SavedKg} KG (${m.percentage}%)`
      ),
    ];

    const blob = new Blob([reportLines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `t2t_carbon_impact_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Carbon Impact Statement downloaded successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Carbon Offset & Environmental Impact"
          description="Real-time CO₂ footprint calculations, ecological benchmarks, and recycling offsets."
        />

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-xs font-semibold text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Impact</span>
          </button>

          <button
            onClick={handleExportReport}
            disabled={loading}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-[#14EF10] via-[#10d00d] to-[#059669] text-black font-bold text-xs shadow-[0_0_20px_rgba(20,239,16,0.3)] hover:shadow-[0_0_28px_rgba(20,239,16,0.5)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Hero Environmental Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net CO2 Offset */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#14EF10]/40 bg-gradient-to-br from-[#0D160D] to-[#0A0A0C] p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14EF10]">Net CO₂ Prevented</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14EF10]/15 text-[#14EF10]">
              <Leaf size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.totalCo2SavedKg} <span className="text-base font-medium text-neutral-400">KG</span>
            </h3>
            <p className="mt-1 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> {data.totalCo2SavedTons} Metric Tons Offset
            </p>
          </div>
        </motion.div>

        {/* Trees Saved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-sm)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--t2t-text-muted)]">Trees Equivalent</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Trees size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.treesPlantedEquivalent} <span className="text-base font-medium text-neutral-400">Trees</span>
            </h3>
            <p className="mt-1 text-xs text-[var(--t2t-text-secondary)]">Based on 20kg CO₂/tree absorption</p>
          </div>
        </motion.div>

        {/* Clean Energy Preserved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-sm)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--t2t-text-muted)]">Energy Preserved</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.energySavedKwh} <span className="text-base font-medium text-neutral-400">kWh</span>
            </h3>
            <p className="mt-1 text-xs text-[var(--t2t-text-secondary)]">4.5 kWh saved per kg recycled</p>
          </div>
        </motion.div>

        {/* Water Preserved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-sm)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--t2t-text-muted)]">Water Saved</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Droplets size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.waterSavedLiters} <span className="text-base font-medium text-neutral-400">Liters</span>
            </h3>
            <p className="mt-1 text-xs text-[var(--t2t-text-secondary)]">15 Liters conserved per kg</p>
          </div>
        </motion.div>
      </div>

      {/* Real-World Impact Equivalents */}
      <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
              <Globe size={18} className="text-[#14EF10]" /> Real-World Environmental Equivalents
            </h3>
            <p className="text-xs text-[var(--t2t-text-secondary)] mt-0.5">
              Tangible real-world impact derived from total diverted waste ({data.totalWeightKg} KG).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]/40">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Car size={24} />
            </div>
            <div>
              <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Car Miles Avoided</p>
              <h4 className="text-xl font-extrabold text-white">{data.equivalents.carMilesAvoided.toLocaleString()} Miles</h4>
              <p className="text-[11px] text-[var(--t2t-text-secondary)] mt-0.5">Automotive emissions offset</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]/40">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Home size={24} />
            </div>
            <div>
              <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Home Electricity Days</p>
              <h4 className="text-xl font-extrabold text-white">{data.equivalents.homeElectricityDays.toLocaleString()} Days</h4>
              <p className="text-[11px] text-[var(--t2t-text-secondary)] mt-0.5">Average household power</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]/40">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Smartphones Charged</p>
              <h4 className="text-xl font-extrabold text-white">{data.equivalents.smartphonesCharged.toLocaleString()} Charges</h4>
              <p className="text-[11px] text-[var(--t2t-text-secondary)] mt-0.5">Battery recharges saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Material Breakdown & Monthly Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Material Carbon Offset Breakdown */}
        <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
                <Recycle size={18} className="text-[#14EF10]" /> Carbon Offset by Material Category
              </h3>
              <span className="text-xs text-[var(--t2t-text-muted)] font-semibold">Factor per KG</span>
            </div>

            <div className="space-y-4 mt-5">
              {data.materialBreakdown.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--t2t-text)] flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#14EF10]" />
                      {item.category}
                      <span className="text-[10px] text-[var(--t2t-text-muted)] font-mono">({item.co2Factor}x factor)</span>
                    </span>
                    <span className="text-[var(--t2t-text-secondary)] font-mono">
                      {item.co2SavedKg} KG CO₂ ({item.percentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 w-full rounded-full bg-[#121216] overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(item.percentage, 5)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#14EF10] to-[#059669]"
                    />
                  </div>
                </div>
              ))}

              {data.materialBreakdown.length === 0 && (
                <div className="py-8 text-center text-xs text-[var(--t2t-text-muted)]">
                  No material breakdown records found.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--t2t-border)] text-xs text-[var(--t2t-text-secondary)] flex items-center justify-between">
            <span>Landfill Space Diverted:</span>
            <span className="font-mono font-bold text-white">{data.landfillDivertedM3} m³</span>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#14EF10]" /> Monthly CO₂ Reduction Trend
              </h3>
              <span className="text-xs text-[#14EF10] font-bold font-mono">Live Sync</span>
            </div>

            <div className="h-[220px] w-full mt-4">
              {data.monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyTrends}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14EF10" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14EF10" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#666" fontSize={11} tickLine={false} />
                    <YAxis stroke="#666" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0D0D11",
                        borderColor: "rgba(20,239,16,0.3)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2SavedKg"
                      stroke="#14EF10"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCo2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--t2t-text-muted)]">
                  Monthly trend visualization will appear as submissions increase.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--t2t-border)] text-xs text-[var(--t2t-text-secondary)] flex items-center justify-between">
            <span>Formula Standard:</span>
            <span className="font-semibold text-neutral-300">EPA WARM Methodology</span>
          </div>
        </div>

      </div>

      {/* Top Ecological Champions Leaderboard */}
      {data.topChampions.length > 0 && (
        <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-[var(--t2t-shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[var(--t2t-text)] flex items-center gap-2">
                <Award size={18} className="text-[#14EF10]" /> Top Ecological Champions
              </h3>
              <p className="text-xs text-[var(--t2t-text-secondary)] mt-0.5">
                Individual users with the highest verified CO₂ offset contributions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.topChampions.map((champ, idx) => (
              <div
                key={champ.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14EF10]/15 text-xs font-bold text-[#14EF10]">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{champ.name}</h4>
                    <p className="text-[11px] text-[var(--t2t-text-secondary)]">{champ.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#14EF10] font-mono">{champ.co2SavedKg} KG CO₂</span>
                  <span className="block text-[10px] text-[var(--t2t-text-muted)] font-mono">{champ.totalWeightKg} KG Waste</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
