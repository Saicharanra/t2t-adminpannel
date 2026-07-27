"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getSubmissionStats() {
  const supabase = await createServerClient();

  try {
    const [totalRes, pendingRes, approvedRes, rejectedRes, weightRes] = await Promise.all([
      supabase.from("waste_submissions").select("*", { count: "exact", head: true }),
      supabase.from("waste_submissions").select("*", { count: "exact", head: true }).eq("status", "Pending"),
      supabase.from("waste_submissions").select("*", { count: "exact", head: true }).eq("status", "Approved"),
      supabase.from("waste_submissions").select("*", { count: "exact", head: true }).eq("status", "Rejected"),
      supabase.from("waste_submissions").select("weight"),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (pendingRes.error) throw pendingRes.error;
    if (approvedRes.error) throw approvedRes.error;
    if (rejectedRes.error) throw rejectedRes.error;
    if (weightRes.error) throw weightRes.error;

    const totalWeightKg = (weightRes.data || []).reduce((acc, curr) => acc + (curr.weight || 0), 0);

    return {
      total: totalRes.count || 0,
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      rejected: rejectedRes.count || 0,
      totalWeightKg,
    };
  } catch (error) {
    console.error("[getSubmissionStats Error]:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalWeightKg: 0,
    };
  }
}

export async function getSubmissions(category?: string, status?: string) {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("waste_submissions").select(`
      *,
      user:users(name, email)
    `);

    if (category && category !== "All") query = query.eq("category", category);
    if (status && status !== "All") query = query.eq("status", status);

    const { data: submissions, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (submissions || []).map((sub: any) => ({
      ...sub,
      userId: sub.user_id,
      imageUrl: sub.image_url,
      aiConfidence: sub.ai_confidence,
    }));
  } catch (error) {
    console.error("[getSubmissions Error]:", error);
    return [];
  }
}

export async function updateSubmissionStatus(id: string, status: string) {
  const supabase = await createServerClient();

  try {
    const { data: submission, error } = await supabase
      .from("waste_submissions")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/waste-submissions");
    return { success: true, submission };
  } catch (error) {
    console.error("[updateSubmissionStatus Error]:", error);
    return { success: false, error: "Failed to update submission status" };
  }
}
