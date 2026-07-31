"use server";

import { createAdminClient } from "@/lib/supabase";

export async function getAnalyticsMetrics() {
  const supabase = createAdminClient();

  try {
    const [wasteAggregateRes, userCountRes, activeBinsRes, ticketCountRes] = await Promise.all([
      supabase.from("waste_submissions").select("weight, weight_kg, points_awarded, points_earned"),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("bins").select("*", { count: "exact", head: true }),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }),
    ]);

    const data = wasteAggregateRes.data || [];
    const totalWeightKg = data.reduce((acc, curr) => acc + Number(curr.weight_kg ?? curr.weight ?? 0), 0);
    const totalPoints = data.reduce((acc, curr) => acc + Number(curr.points_awarded ?? curr.points_earned ?? 0), 0);
    
    const userCount = userCountRes.count || 0;
    const activeBins = activeBinsRes.count || 0;
    const openTickets = ticketCountRes.count || 0;

    const carbonSavedKg = Math.round(totalWeightKg * 0.5 * 10) / 10;

    return {
      totalWeightKg: Math.round(totalWeightKg * 100) / 100,
      totalPoints,
      carbonSavedKg,
      userCount,
      activeBins,
      openTickets,
    };
  } catch (error) {
    console.error("[getAnalyticsMetrics Error]:", error);
    return {
      totalWeightKg: 0,
      totalPoints: 0,
      carbonSavedKg: 0,
      userCount: 0,
      activeBins: 0,
      openTickets: 0,
    };
  }
}
