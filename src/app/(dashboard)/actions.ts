"use server";

import { createServerClient } from "@/lib/supabase";

export interface DashboardOverview {
  totalUsers: number;
  totalWasteKg: number;
  activeBins: number;
  carbonSavedKg: number;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await createServerClient();

  try {
    const [usersCountRes, wasteAggregateRes, activeBinsRes] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("waste_submissions").select("weight"),
      supabase.from("bins").select("*", { count: "exact", head: true }).eq("status", "Active"),
    ]);

    if (usersCountRes.error) throw usersCountRes.error;
    if (wasteAggregateRes.error) throw wasteAggregateRes.error;
    if (activeBinsRes.error) throw activeBinsRes.error;

    const totalUsers = usersCountRes.count || 0;
    const activeBins = activeBinsRes.count || 0;
    
    // Sum weights in JS from waste_submissions (or fallback to 0)
    const totalWasteKg = (wasteAggregateRes.data || []).reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const carbonSavedKg = Math.round(totalWasteKg * 0.5 * 10) / 10;

    return {
      totalUsers,
      totalWasteKg,
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
