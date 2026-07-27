"use server";

import { createServerClient } from "@/lib/supabase";

export async function getReportsOverview() {
  const supabase = await createServerClient();

  try {
    const [userCountRes, submissionCountRes, businessCountRes, binCountRes] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("waste_submissions").select("*", { count: "exact", head: true }),
      supabase.from("businesses").select("*", { count: "exact", head: true }),
      supabase.from("bins").select("*", { count: "exact", head: true }),
    ]);

    if (userCountRes.error) throw userCountRes.error;
    if (submissionCountRes.error) throw submissionCountRes.error;
    if (businessCountRes.error) throw businessCountRes.error;
    if (binCountRes.error) throw binCountRes.error;

    return {
      userCount: userCountRes.count || 0,
      submissionCount: submissionCountRes.count || 0,
      businessCount: businessCountRes.count || 0,
      binCount: binCountRes.count || 0,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[getReportsOverview Error]:", error);
    return {
      userCount: 0,
      submissionCount: 0,
      businessCount: 0,
      binCount: 0,
      generatedAt: new Date().toISOString(),
    };
  }
}
