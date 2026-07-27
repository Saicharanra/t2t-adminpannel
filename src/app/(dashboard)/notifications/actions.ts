"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  } catch (error) {
    console.error("[getNotifications Error]:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    revalidatePath("/notifications");
    return { success: true, notification };
  } catch (error) {
    console.error("[markNotificationAsRead Error]:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("[markAllNotificationsAsRead Error]:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}
