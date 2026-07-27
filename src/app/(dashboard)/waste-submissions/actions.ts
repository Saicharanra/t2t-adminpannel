"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSubmissionStats() {
  try {
    const [total, pending, approved, rejected, weightAgg] = await Promise.all([
      prisma.wasteSubmission.count(),
      prisma.wasteSubmission.count({ where: { status: "Pending" } }),
      prisma.wasteSubmission.count({ where: { status: "Approved" } }),
      prisma.wasteSubmission.count({ where: { status: "Rejected" } }),
      prisma.wasteSubmission.aggregate({ _sum: { weight: true } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      totalWeightKg: weightAgg._sum.weight || 0,
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
  try {
    const where: any = {};
    if (category && category !== "All") where.category = category;
    if (status && status !== "All") where.status = status;

    const submissions = await prisma.wasteSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return submissions;
  } catch (error) {
    console.error("[getSubmissions Error]:", error);
    return [];
  }
}

export async function updateSubmissionStatus(id: string, status: string) {
  try {
    const submission = await prisma.wasteSubmission.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/waste-submissions");
    return { success: true, submission };
  } catch (error) {
    console.error("[updateSubmissionStatus Error]:", error);
    return { success: false, error: "Failed to update submission status" };
  }
}
