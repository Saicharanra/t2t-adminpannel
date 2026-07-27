"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const supabase = await createServerClient();

  try {
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (notifications || []).map((notif: any) => ({
      ...notif,
      createdAt: notif.created_at,
    }));
  } catch (error) {
    console.error("[getNotifications Error]:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createServerClient();

  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/notifications");
    return { success: true, notification };
  } catch (error) {
    console.error("[markNotificationAsRead Error]:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (error) throw error;

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("[markAllNotificationsAsRead Error]:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}
