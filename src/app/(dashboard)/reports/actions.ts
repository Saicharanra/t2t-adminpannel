"use server";

import { prisma } from "@/lib/prisma";

export async function getReportsOverview() {
  try {
    const [userCount, submissionCount, businessCount, binCount] = await Promise.all([
      prisma.user.count(),
      prisma.wasteSubmission.count(),
      prisma.business.count(),
      prisma.bin.count(),
    ]);

    return {
      userCount,
      submissionCount,
      businessCount,
      binCount,
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
