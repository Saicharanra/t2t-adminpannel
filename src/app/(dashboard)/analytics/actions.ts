"use server";

import { prisma } from "@/lib/prisma";

export async function getAnalyticsMetrics() {
  try {
    const [wasteAggregate, userCount, activeBins, ticketCount] = await Promise.all([
      prisma.wasteSubmission.aggregate({
        _sum: { weight: true, points: true },
      }),
      prisma.user.count(),
      prisma.bin.count({ where: { status: "Active" } }),
      prisma.supportTicket.count({ where: { status: "Open" } }),
    ]);

    const totalWeightKg = wasteAggregate._sum.weight || 0;
    const totalPoints = wasteAggregate._sum.points || 0;
    const carbonSavedKg = Math.round(totalWeightKg * 0.5 * 10) / 10;

    return {
      totalWeightKg,
      totalPoints,
      carbonSavedKg,
      userCount,
      activeBins,
      openTickets: ticketCount,
    };
  } catch (error) {
    console.error("[getAnalyticsMetrics Error]:", error);
    return {
      totalWeightKg: 0,
      totalPoints: 0,
      carbonSavedKg: 0,
      userCount: 0,
      activeBins: 0,
      openTickets: 0,
    };
  }
}
