"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface BusinessFilters {
  search?: string;
  status?: string;
  category?: string;
}

export async function getBusinesses(filters: BusinessFilters = {}) {
  try {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.status && filters.status !== "All") {
      where.status = filters.status;
    }

    if (filters.category && filters.category !== "All") {
      where.category = filters.category;
    }

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { joinedAt: "desc" },
    });

    return businesses;
  } catch (error) {
    console.error("[getBusinesses Error]:", error);
    return [];
  }
}

export async function getBusinessStats() {
  try {
    const [total, active, pending, rejected] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: "Active" } }),
      prisma.business.count({ where: { status: "Pending Approval" } }),
      prisma.business.count({ where: { status: "Rejected" } }),
    ]);

    return { total, active, pending, rejected };
  } catch (error) {
    console.error("[getBusinessStats Error]:", error);
    return { total: 0, active: 0, pending: 0, rejected: 0 };
  }
}

export async function updateBusinessStatus(id: string, status: string) {
  try {
    const business = await prisma.business.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/businesses");
    return { success: true, business };
  } catch (error) {
    console.error("[updateBusinessStatus Error]:", error);
    return { success: false, error: "Failed to update business status" };
  }
}
