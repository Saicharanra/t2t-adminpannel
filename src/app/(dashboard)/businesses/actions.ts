"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface BusinessFilters {
  search?: string;
  status?: string;
  category?: string;
}

export async function getBusinesses(filters: BusinessFilters = {}) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("businesses").select("*");

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      query = query.or(`name.ilike.${searchVal},email.ilike.${searchVal},category.ilike.${searchVal}`);
    }

    if (filters.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }

    if (filters.category && filters.category !== "All") {
      query = query.eq("category", filters.category);
    }

    const { data: businesses, error } = await query.order("joined_at", { ascending: false });

    if (error) throw error;

    // Map business fields if needed (e.g. joined_at to joinedAt, document_url to documentUrl)
    return (businesses || []).map((biz: any) => ({
      ...biz,
      joinedAt: biz.joined_at,
      documentUrl: biz.document_url,
    }));
  } catch (error) {
    console.error("[getBusinesses Error]:", error);
    return [];
  }
}

export async function getBusinessStats() {
  const supabase = await createServerClient();

  try {
    const [totalRes, activeRes, pendingRes, rejectedRes] = await Promise.all([
      supabase.from("businesses").select("*", { count: "exact", head: true }),
      supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "Active"),
      supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "Pending Approval"),
      supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "Rejected"),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (activeRes.error) throw activeRes.error;
    if (pendingRes.error) throw pendingRes.error;
    if (rejectedRes.error) throw rejectedRes.error;

    return {
      total: totalRes.count || 0,
      active: activeRes.count || 0,
      pending: pendingRes.count || 0,
      rejected: rejectedRes.count || 0,
    };
  } catch (error) {
    console.error("[getBusinessStats Error]:", error);
    return { total: 0, active: 0, pending: 0, rejected: 0 };
  }
}

export async function updateBusinessStatus(id: string, status: string) {
  const supabase = await createServerClient();

  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/businesses");
    return { success: true, business };
  } catch (error) {
    console.error("[updateBusinessStatus Error]:", error);
    return { success: false, error: "Failed to update business status" };
  }
}
