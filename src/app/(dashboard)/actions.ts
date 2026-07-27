"use server";

import { prisma } from "@/lib/prisma";

export interface DashboardOverview {
  totalUsers: number;
  totalWasteKg: number;
  activeBins: number;
  carbonSavedKg: number;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  try {
    const [totalUsers, wasteAggregate, activeBins] = await Promise.all([
      prisma.user.count(),
      prisma.wasteSubmission.aggregate({
        _sum: {
          weight: true,
        },
      }),
      prisma.bin.count({
        where: {
          status: "Active",
        },
      }),
    ]);

    const totalWasteKg = wasteAggregate._sum.weight || 0;
    const carbonSavedKg = Math.round(totalWasteKg * 0.5 * 10) / 10;

    return {
      totalUsers,
      totalWasteKg,
      activeBins,
      carbonSavedKg,
    };
  } catch (error) {
    console.error("[getDashboardOverview Error]:", error);
    return {
      totalUsers: 0,
      totalWasteKg: 0,
      activeBins: 0,
      carbonSavedKg: 0,
    };
  }
}
