"use server";

import { createServerClient } from "@/lib/supabase";

export async function getAnalyticsMetrics() {
  const supabase = await createServerClient();

  try {
    const [wasteAggregateRes, userCountRes, activeBinsRes, ticketCountRes] = await Promise.all([
      supabase.from("waste_submissions").select("weight, points"),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("bins").select("*", { count: "exact", head: true }).eq("status", "Active"),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "Open"),
    ]);

    if (wasteAggregateRes.error) throw wasteAggregateRes.error;
    if (userCountRes.error) throw userCountRes.error;
    if (activeBinsRes.error) throw activeBinsRes.error;
    if (ticketCountRes.error) throw ticketCountRes.error;

    const data = wasteAggregateRes.data || [];
    const totalWeightKg = data.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const totalPoints = data.reduce((acc, curr) => acc + (curr.points || 0), 0);
    
    const userCount = userCountRes.count || 0;
    const activeBins = activeBinsRes.count || 0;
    const openTickets = ticketCountRes.count || 0;

    const carbonSavedKg = Math.round(totalWeightKg * 0.5 * 10) / 10;

    return {
      totalWeightKg,
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
