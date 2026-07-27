"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getBinStats() {
  const supabase = await createServerClient();

  try {
    const [totalRes, activeRes, fullRes, maintenanceRes] = await Promise.all([
      supabase.from("bins").select("*", { count: "exact", head: true }),
      supabase.from("bins").select("*", { count: "exact", head: true }).eq("status", "Active"),
      supabase.from("bins").select("*", { count: "exact", head: true }).eq("status", "Full"),
      supabase.from("bins").select("*", { count: "exact", head: true }).eq("status", "Maintenance"),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (activeRes.error) throw activeRes.error;
    if (fullRes.error) throw fullRes.error;
    if (maintenanceRes.error) throw maintenanceRes.error;

    return {
      total: totalRes.count || 0,
      active: activeRes.count || 0,
      full: fullRes.count || 0,
      maintenance: maintenanceRes.count || 0,
    };
  } catch (error) {
    console.error("[getBinStats Error]:", error);
    return { total: 0, active: 0, full: 0, maintenance: 0 };
  }
}

export async function getBins(status?: string) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("bins").select("*");
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    const { data: bins, error } = await query.order("fill_percentage", { ascending: false });

    if (error) throw error;

    return (bins || []).map((bin: any) => ({
      ...bin,
      fillPercentage: bin.fill_percentage,
      maintenanceStatus: bin.maintenance_status,
      lastCleared: bin.last_cleared,
    }));
  } catch (error) {
    console.error("[getBins Error]:", error);
    return [];
  }
}

export async function updateBinStatus(id: string, status: string, fillPercentage?: number) {
  const supabase = await createServerClient();

  try {
    const data: any = { status };
    if (fillPercentage !== undefined) data.fill_percentage = fillPercentage;
    if (status === "Active") data.last_cleared = new Date().toISOString();

    const { data: bin, error } = await supabase
      .from("bins")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/bins");
    return { success: true, bin };
  } catch (error) {
    console.error("[updateBinStatus Error]:", error);
    return { success: false, error: "Failed to update bin status" };
  }
}
