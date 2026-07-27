"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBinStats() {
  try {
    const [total, active, full, maintenance] = await Promise.all([
      prisma.bin.count(),
      prisma.bin.count({ where: { status: "Active" } }),
      prisma.bin.count({ where: { status: "Full" } }),
      prisma.bin.count({ where: { status: "Maintenance" } }),
    ]);

    return { total, active, full, maintenance };
  } catch (error) {
    console.error("[getBinStats Error]:", error);
    return { total: 0, active: 0, full: 0, maintenance: 0 };
  }
}

export async function getBins(status?: string) {
  try {
    const where: any = {};
    if (status && status !== "All") where.status = status;

    const bins = await prisma.bin.findMany({
      where,
      orderBy: { fillPercentage: "desc" },
    });

    return bins;
  } catch (error) {
    console.error("[getBins Error]:", error);
    return [];
  }
}

export async function updateBinStatus(id: string, status: string, fillPercentage?: number) {
  try {
    const data: any = { status };
    if (fillPercentage !== undefined) data.fillPercentage = fillPercentage;
    if (status === "Active") data.lastCleared = new Date();

    const bin = await prisma.bin.update({
      where: { id },
      data,
    });

    revalidatePath("/bins");
    return { success: true, bin };
  } catch (error) {
    console.error("[updateBinStatus Error]:", error);
    return { success: false, error: "Failed to update bin status" };
  }
}
