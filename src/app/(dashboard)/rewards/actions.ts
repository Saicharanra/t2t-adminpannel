"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getRewardStats() {
  const supabase = await createServerClient();

  try {
    const [totalRewardsRes, pendingRedemptionsRes, totalRedemptionsRes] = await Promise.all([
      supabase.from("rewards").select("*", { count: "exact", head: true }),
      supabase.from("redemption_requests").select("*", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("redemption_requests").select("*", { count: "exact", head: true }),
    ]);

    if (totalRewardsRes.error) throw totalRewardsRes.error;
    if (pendingRedemptionsRes.error) throw pendingRedemptionsRes.error;
    if (totalRedemptionsRes.error) throw totalRedemptionsRes.error;

    return {
      totalRewards: totalRewardsRes.count || 0,
      pendingRedemptions: pendingRedemptionsRes.count || 0,
      totalRedemptions: totalRedemptionsRes.count || 0,
    };
  } catch (error) {
    console.error("[getRewardStats Error]:", error);
    return { totalRewards: 0, pendingRedemptions: 0, totalRedemptions: 0 };
  }
}

export async function getRewards(category?: string) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("rewards").select("*");
    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data: rewards, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return (rewards || []).map((reward: any) => ({
      ...reward,
      pointsRequired: reward.points_required,
    }));
  } catch (error) {
    console.error("[getRewards Error]:", error);
    return [];
  }
}

export async function getRedemptions(status?: string) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("redemption_requests").select(`
      *,
      reward:rewards(*),
      user:users(name, email)
    `);

    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    const { data: redemptions, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return (redemptions || []).map((red: any) => ({
      ...red,
      reward: red.reward ? {
        ...red.reward,
        pointsRequired: red.reward.points_required,
      } : null,
    }));
  } catch (error) {
    console.error("[getRedemptions Error]:", error);
    return [];
  }
}
