"use server";

import { createAdminClient } from "@/lib/supabase";

export interface MaterialImpact {
  category: string;
  weightKg: number;
  co2Factor: number;
  co2SavedKg: number;
  percentage: number;
}

export interface MonthlyImpactData {
  month: string;
  co2SavedKg: number;
  weightKg: number;
}

export interface CarbonChampion {
  id: string;
  name: string;
  email: string;
  totalWeightKg: number;
  co2SavedKg: number;
  avatarUrl?: string;
}

export async function getCarbonImpactMetrics(): Promise<{
  success: boolean;
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
  error?: string;
}> {
  const supabase = createAdminClient();

  try {
    const { data: submissions, error } = await supabase
      .from("waste_submissions")
      .select("id, category, weight_kg, weight, status, created_at, user_id")
      .eq("status", "approved");

    if (error) {
      console.error("[getCarbonImpactMetrics Error]:", error);
      throw error;
    }

    const rows = submissions || [];

    // Factor per KG:
    // Plastic: 1.8 kg CO2/kg
    // E-Waste: 2.5 kg CO2/kg
    // Metal: 3.0 kg CO2/kg
    // Paper: 1.2 kg CO2/kg
    // Glass: 0.8 kg CO2/kg
    // Default: 1.5 kg CO2/kg
    const getCo2Factor = (cat: string | null): number => {
      if (!cat) return 1.5;
      const c = cat.toLowerCase();
      if (c.includes("plastic")) return 1.8;
      if (c.includes("e-waste") || c.includes("electronic")) return 2.5;
      if (c.includes("metal")) return 3.0;
      if (c.includes("paper") || c.includes("cardboard")) return 1.2;
      if (c.includes("glass")) return 0.8;
      return 1.5;
    };

    let totalWeightKg = 0;
    let totalCo2SavedKg = 0;

    const categoryTotals: Record<string, { weightKg: number; co2SavedKg: number; factor: number }> = {};
    const userTotals: Record<string, { weightKg: number; co2SavedKg: number }> = {};
    const monthlyMap: Record<string, { weightKg: number; co2SavedKg: number }> = {};

    rows.forEach((row) => {
      const weight = Number(row.weight_kg ?? row.weight ?? 0);
      const categoryName = row.category || "General Recyclables";
      const factor = getCo2Factor(categoryName);
      const co2 = weight * factor;

      totalWeightKg += weight;
      totalCo2SavedKg += co2;

      // Group by Category
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { weightKg: 0, co2SavedKg: 0, factor };
      }
      categoryTotals[categoryName].weightKg += weight;
      categoryTotals[categoryName].co2SavedKg += co2;

      // Group by User
      if (row.user_id) {
        if (!userTotals[row.user_id]) {
          userTotals[row.user_id] = { weightKg: 0, co2SavedKg: 0 };
        }
        userTotals[row.user_id].weightKg += weight;
        userTotals[row.user_id].co2SavedKg += co2;
      }

      // Group by Month (e.g. "Jul 2026")
      if (row.created_at) {
        const date = new Date(row.created_at);
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { weightKg: 0, co2SavedKg: 0 };
        }
        monthlyMap[monthKey].weightKg += weight;
        monthlyMap[monthKey].co2SavedKg += co2;
      }
    });

    // Material Breakdown List
    const materialBreakdown: MaterialImpact[] = Object.keys(categoryTotals).map((cat) => {
      const item = categoryTotals[cat];
      return {
        category: cat,
        weightKg: Math.round(item.weightKg * 100) / 100,
        co2Factor: item.factor,
        co2SavedKg: Math.round(item.co2SavedKg * 100) / 100,
        percentage: totalCo2SavedKg > 0 ? Math.round((item.co2SavedKg / totalCo2SavedKg) * 100) : 0,
      };
    });

    // Monthly trends
    const monthlyTrends: MonthlyImpactData[] = Object.keys(monthlyMap).map((m) => ({
      month: m,
      weightKg: Math.round(monthlyMap[m].weightKg * 100) / 100,
      co2SavedKg: Math.round(monthlyMap[m].co2SavedKg * 100) / 100,
    }));

    // Environmental metrics calculations
    const treesPlantedEquivalent = Math.round((totalCo2SavedKg / 20) * 10) / 10;
    const energySavedKwh = Math.round(totalWeightKg * 4.5 * 10) / 10;
    const waterSavedLiters = Math.round(totalWeightKg * 15 * 10) / 10;
    const landfillDivertedM3 = Math.round(totalWeightKg * 0.003 * 1000) / 1000;

    // Real-world equivalents
    const carMilesAvoided = Math.round(totalCo2SavedKg * 2.48); // ~2.48 miles per kg CO2
    const homeElectricityDays = Math.round(totalCo2SavedKg * 0.15); // ~0.15 days per kg CO2
    const smartphonesCharged = Math.round(totalCo2SavedKg * 121.6); // ~121.6 charges per kg CO2

    // Fetch top user details for champions
    const topUserIds = Object.keys(userTotals)
      .sort((a, b) => userTotals[b].co2SavedKg - userTotals[a].co2SavedKg)
      .slice(0, 5);

    let topChampions: CarbonChampion[] = [];
    if (topUserIds.length > 0) {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", topUserIds);

      if (users) {
        topChampions = users.map((u) => ({
          id: u.id,
          name: u.full_name || "Anonymous Recycler",
          email: u.email || "",
          avatarUrl: u.avatar_url,
          totalWeightKg: Math.round(userTotals[u.id]?.weightKg || 0),
          co2SavedKg: Math.round(userTotals[u.id]?.co2SavedKg || 0),
        }));
      }
    }

    return {
      success: true,
      totalWeightKg: Math.round(totalWeightKg * 100) / 100,
      totalCo2SavedKg: Math.round(totalCo2SavedKg * 100) / 100,
      totalCo2SavedTons: Math.round((totalCo2SavedKg / 1000) * 1000) / 1000,
      treesPlantedEquivalent,
      energySavedKwh,
      waterSavedLiters,
      landfillDivertedM3,
      equivalents: {
        carMilesAvoided,
        homeElectricityDays,
        smartphonesCharged,
      },
      materialBreakdown,
      monthlyTrends,
      topChampions,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to calculate carbon impact";
    return {
      success: false,
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
      error: msg,
    };
  }
}
