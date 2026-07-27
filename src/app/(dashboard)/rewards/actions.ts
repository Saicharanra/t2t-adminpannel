"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRewardStats() {
  try {
    const [totalRewards, pendingRedemptions, totalRedemptions] = await Promise.all([
      prisma.reward.count(),
      prisma.redemptionRequest.count({ where: { status: "Pending" } }),
      prisma.redemptionRequest.count(),
    ]);

    return { totalRewards, pendingRedemptions, totalRedemptions };
  } catch (error) {
    console.error("[getRewardStats Error]:", error);
    return { totalRewards: 0, pendingRedemptions: 0, totalRedemptions: 0 };
  }
}

export async function getRewards(category?: string) {
  try {
    const where: any = {};
    if (category && category !== "All") where.category = category;

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return rewards;
  } catch (error) {
    console.error("[getRewards Error]:", error);
    return [];
  }
}

export async function getRedemptions(status?: string) {
  try {
    const where: any = {};
    if (status && status !== "All") where.status = status;

    const redemptions = await prisma.redemptionRequest.findMany({
      where,
      include: {
        reward: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return redemptions;
  } catch (error) {
    console.error("[getRedemptions Error]:", error);
    return [];
  }
}
