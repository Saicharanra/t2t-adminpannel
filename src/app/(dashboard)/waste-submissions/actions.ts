"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getSubmissionStats() {
  const supabase = createAdminClient();

  try {
    const { data: allSubmissions, error } = await supabase
      .from("waste_submissions")
      .select("status, weight_kg");

    if (error) throw error;

    const total = (allSubmissions || []).length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalWeightKg = 0;

    (allSubmissions || []).forEach((sub: any) => {
      const st = (sub.status || "").toLowerCase();
      if (st === "pending") pending++;
      else if (st === "verified" || st === "approved") approved++;
      else if (st === "rejected") rejected++;

      const w = Number(sub.weight_kg ?? 0);
      totalWeightKg += w;
    });

    return {
      total,
      pending,
      approved,
      rejected,
      totalWeightKg: Math.round(totalWeightKg * 100) / 100,
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
  const supabase = createAdminClient();

  try {
    let query = supabase.from("waste_submissions").select("*");

    if (category && category !== "All" && category !== "All Categories") {
      query = query.ilike("category", category);
    }

    if (status && status !== "All") {
      const st = status.toLowerCase();
      if (st === "approved" || st === "verified") {
        query = query.in("status", ["APPROVED", "VERIFIED", "Approved", "Verified", "approved", "verified"]);
      } else if (st === "pending") {
        query = query.in("status", ["PENDING", "Pending", "pending"]);
      } else if (st === "rejected") {
        query = query.in("status", ["REJECTED", "Rejected", "rejected"]);
      } else {
        query = query.ilike("status", status);
      }
    }

    const { data: submissions, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    const rawSubmissions = submissions || [];

    // Batch fetch user profile details to prevent PostgREST relation errors
    const userIds = Array.from(new Set(rawSubmissions.map((s: any) => s.user_id).filter(Boolean)));
    const profileMap = new Map<string, any>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      (profiles || []).forEach((p: any) => {
        profileMap.set(p.id, p);
      });
    }

    return rawSubmissions.map((sub: any) => {
      const rawStatus = (sub.status || "pending").toLowerCase();
      let normalizedStatus = "Pending";
      if (rawStatus === "verified" || rawStatus === "approved") normalizedStatus = "Approved";
      else if (rawStatus === "rejected") normalizedStatus = "Rejected";

      const profile = profileMap.get(sub.user_id);

      // Ensure valid displayable public image URL from waste-images bucket
      let imageUrl = sub.image_url;
      if (!imageUrl && sub.image_path) {
        const { data: urlData } = supabase.storage.from("waste-images").getPublicUrl(sub.image_path);
        imageUrl = urlData.publicUrl;
      } else if (imageUrl && !imageUrl.startsWith("http")) {
        const { data: urlData } = supabase.storage.from("waste-images").getPublicUrl(imageUrl);
        imageUrl = urlData.publicUrl;
      }

      return {
        id: sub.id,
        userId: sub.user_id,
        userName: profile?.full_name || (sub.user_id ? `User (${sub.user_id.slice(0, 6)}...)` : "Eco Partner"),
        userEmail: profile?.email || "",
        category: sub.category || "General Waste",
        weight: Number(sub.weight_kg ?? 0),
        location: sub.location || "Community Collection Point",
        latitude: sub.latitude,
        longitude: sub.longitude,
        imageUrl: imageUrl || null,
        pointsAwarded: sub.points_awarded ?? sub.points_earned ?? 0,
        status: normalizedStatus,
        rawStatus: sub.status,
        rejectionReason: sub.rejection_reason || sub.admin_review_notes,
        aiConfidence: sub.ai_confidence,
        createdAt: sub.created_at,
      };
    });
  } catch (error) {
    console.error("[getSubmissions Error]:", error);
    return [];
  }
}

export async function updateSubmissionStatus(id: string, status: string, points?: number, rejectionReason?: string) {
  const supabase = createAdminClient();

  try {
    const isApprove = status.toLowerCase() === "approved" || status.toLowerCase() === "verified";
    const dbStatus = isApprove ? "approved" : "rejected";
    const pointsToAward = points || 15;

    const updateData: any = {
      status: dbStatus,
      updated_at: new Date().toISOString(),
    };

    if (isApprove) {
      updateData.verified_at = new Date().toISOString();
      updateData.points_awarded = pointsToAward;
      updateData.points_earned = pointsToAward;
    } else {
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
        updateData.admin_review_notes = rejectionReason;
      }
    }

    let { data: submission, error } = await supabase
      .from("waste_submissions")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    // Resilient fallback if specific column triggers PGRST204 due to schema cache
    if (error && (error.code === "PGRST204" || error.message.includes("column"))) {
      const minimalUpdate = { status: dbStatus, updated_at: new Date().toISOString() };
      const fallbackRes = await supabase
        .from("waste_submissions")
        .update(minimalUpdate)
        .eq("id", id)
        .select("*")
        .single();

      if (!fallbackRes.error) {
        submission = fallbackRes.data;
        error = null;
      }
    }

    if (error) throw error;

    // Direct points backup in JS if database trigger didn't execute
    if (isApprove && submission?.user_id) {
      try {
        const { data: u } = await supabase.from("users").select("points, reward_points_balance").eq("id", submission.user_id).maybeSingle();
        if (u) {
          const currentPts = Number(u.points ?? u.reward_points_balance ?? 0);
          await supabase.from("users").update({
            points: currentPts + pointsToAward,
            reward_points_balance: currentPts + pointsToAward,
            updated_at: new Date().toISOString(),
          }).eq("id", submission.user_id);
        }

        // Add points_history record
        try {
          await supabase.from("points_history").insert({
            user_id: submission.user_id,
            submission_id: id,
            points: pointsToAward,
            transaction_type: "EARNED",
            description: `Points earned from ${submission.category || "recycling"}`,
            created_at: new Date().toISOString(),
          });
        } catch (_) {}

        // Add notification
        try {
          const { data: profile } = await supabase.from("profiles").select("email").eq("id", submission.user_id).maybeSingle();
          if (profile?.email) {
            await supabase.from("notifications").insert({
              user_id: submission.user_id,
              email: profile.email,
              type: "submission_approved",
              title: "Submission Approved 🎉",
              message: `Your ${submission.category || "waste"} submission was approved and ${pointsToAward} points were added!`,
              read: false,
              created_at: new Date().toISOString(),
            });
          }
        } catch (_) {}
      } catch (_) {}
    }

    revalidatePath("/waste-submissions");
    return { success: true, submission };
  } catch (error: any) {
    console.error("[updateSubmissionStatus Error]:", error);
    return { success: false, error: error.message || "Failed to update submission status" };
  }
}
