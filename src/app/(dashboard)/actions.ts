"use server";

import { createAdminClient } from "@/lib/supabase";

export interface DashboardOverview {
  totalUsers: number;
  totalWasteKg: number;
  activeBins: number;
  carbonSavedKg: number;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = createAdminClient();

  try {
    const [usersCountRes, wasteAggregateRes, activeBinsRes] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("waste_submissions").select("weight, weight_kg"),
      supabase.from("bins").select("*", { count: "exact", head: true }),
    ]);

    const totalUsers = usersCountRes.count || 0;
    const activeBins = activeBinsRes.count || 0;
    
    const totalWasteKg = (wasteAggregateRes.data || []).reduce(
      (acc, curr) => acc + Number(curr.weight_kg ?? curr.weight ?? 0),
      0
    );
    const carbonSavedKg = Math.round(totalWasteKg * 0.5 * 10) / 10;

    return {
      totalUsers,
      totalWasteKg: Math.round(totalWasteKg * 100) / 100,
      activeBins,
      carbonSavedKg,
    };
  } catch (error) {
    console.error("[getDashboardOverview Error]:", error);
    return {
      totalUsers: 0,
      totalWasteKg: 0,
      activeBins: 0,
      carbonSavedKg: 0,
    };
  }
}
