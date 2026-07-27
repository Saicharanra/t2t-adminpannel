"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface UserFilters {
  search?: string;
  status?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  pointsMin?: number;
  pointsMax?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newToday: number;
}

export async function getUserStats(): Promise<UserStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, activeUsers, newToday] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "Active" } }),
    prisma.user.count({
      where: {
        joinedAt: {
          gte: today,
        },
      },
    }),
  ]);

  // For verified users, we'll count those with email (assuming email presence means verified)
  const verifiedUsers = await prisma.user.count({
    where: {
      email: {
        not: null,
      },
    },
  });

  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    newToday,
  };
}

export async function getUsers({
  page = 1,
  pageSize = 25,
  sortBy = "joinedAt",
  sortOrder = "desc",
  filters = {},
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: UserFilters;
}) {
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
      { id: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.city && filters.city !== "all") {
    where.city = filters.city;
  }

  if (filters.dateFrom) {
    where.joinedAt = {
      ...where.joinedAt,
      gte: new Date(filters.dateFrom),
    };
  }

  if (filters.dateTo) {
    where.joinedAt = {
      ...where.joinedAt,
      lte: new Date(filters.dateTo),
    };
  }

  if (filters.pointsMin !== undefined) {
    where.points = {
      ...where.points,
      gte: filters.pointsMin,
    };
  }

  if (filters.pointsMax !== undefined) {
    where.points = {
      ...where.points,
      lte: filters.pointsMax,
    };
  }

  // Fetch users with submission count
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      redemptions: {
        include: {
          reward: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          submissions: true,
          redemptions: true,
          tickets: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate carbon contribution (rough estimate: 1kg waste = 0.5kg CO2 saved)
  const carbonSaved = user.wasteSubmitted * 0.5;

  return {
    ...user,
    carbonSaved,
  };
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    status?: string;
  }
) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/users");
  return user;
}

export async function adjustUserPoints(
  id: string,
  points: number,
  type: "add" | "subtract"
) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { points: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const newPoints =
    type === "add" ? user.points + points : Math.max(0, user.points - points);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { points: newPoints },
  });

  revalidatePath("/users");
  return updatedUser;
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status?: string;
}) {
  const user = await prisma.user.create({
    data: {
      ...data,
      status: data.status || "Active",
    },
  });

  revalidatePath("/users");
  return user;
}

export async function getCities() {
  const cities = await prisma.user.findMany({
    where: {
      city: {
        not: null,
      },
    },
    select: {
      city: true,
    },
    distinct: ["city"],
  });

  return cities.map((c) => c.city).filter(Boolean);
}

export async function exportUsers(filters: UserFilters, format: "csv" | "excel" | "pdf") {
  // Build where clause
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.city && filters.city !== "all") {
    where.city = filters.city;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { joinedAt: "desc" },
  });

  // Return data for client-side export processing
  return users;
}

export async function bulkUpdateUserStatus(userIds: string[], status: string) {
  await prisma.user.updateMany({
    where: {
      id: {
        in: userIds,
      },
    },
    data: {
      status,
    },
  });

  revalidatePath("/users");
  return { success: true, count: userIds.length };
}

export async function bulkDeleteUsers(userIds: string[]) {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  revalidatePath("/users");
  return { success: true, count: userIds.length };
}
