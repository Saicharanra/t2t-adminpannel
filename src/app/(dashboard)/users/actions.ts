"use server";

import { createServerClient } from "@/lib/supabase";
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
  const supabase = await createServerClient();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRes, activeRes, newTodayRes, verifiedRes] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "Active"),
      supabase.from("users").select("*", { count: "exact", head: true }).gte("joined_at", today.toISOString()),
      supabase.from("users").select("*", { count: "exact", head: true }).neq("email", ""),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (activeRes.error) throw activeRes.error;
    if (newTodayRes.error) throw newTodayRes.error;
    if (verifiedRes.error) throw verifiedRes.error;

    return {
      totalUsers: totalRes.count || 0,
      activeUsers: activeRes.count || 0,
      verifiedUsers: verifiedRes.count || 0,
      newToday: newTodayRes.count || 0,
    };
  } catch (error) {
    console.error("[getUserStats Error]:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      newToday: 0,
    };
  }
}

export async function getUsers({
  page = 1,
  pageSize = 25,
  sortBy = "joined_at",
  sortOrder = "desc",
  filters = {},
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: UserFilters;
}) {
  const supabase = await createServerClient();

  try {
    const skip = (page - 1) * pageSize;

    // Convert Prisma mapping camelCase fields to snake_case for DB querying if needed
    const dbSortBy = sortBy === "joinedAt" ? "joined_at" : sortBy;

    // Build query
    let query = supabase.from("users").select("*, waste_submissions(count)");

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      query = query.or(`name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal},id.eq.${filters.search}`);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.city && filters.city !== "all") {
      query = query.eq("city", filters.city);
    }

    if (filters.dateFrom) {
      query = query.gte("joined_at", new Date(filters.dateFrom).toISOString());
    }

    if (filters.dateTo) {
      query = query.lte("joined_at", new Date(filters.dateTo).toISOString());
    }

    if (filters.pointsMin !== undefined) {
      query = query.gte("points", filters.pointsMin);
    }

    if (filters.pointsMax !== undefined) {
      query = query.lte("points", filters.pointsMax);
    }

    // Clone query for count calculation
    let countQuery = supabase.from("users").select("*", { count: "exact", head: true });
    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      countQuery = countQuery.or(`name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal},id.eq.${filters.search}`);
    }
    if (filters.status && filters.status !== "all") countQuery = countQuery.eq("status", filters.status);
    if (filters.city && filters.city !== "all") countQuery = countQuery.eq("city", filters.city);
    if (filters.dateFrom) countQuery = countQuery.gte("joined_at", new Date(filters.dateFrom).toISOString());
    if (filters.dateTo) countQuery = countQuery.lte("joined_at", new Date(filters.dateTo).toISOString());
    if (filters.pointsMin !== undefined) countQuery = countQuery.gte("points", filters.pointsMin);
    if (filters.pointsMax !== undefined) countQuery = countQuery.lte("points", filters.pointsMax);

    const [dataRes, countRes] = await Promise.all([
      query
        .order(dbSortBy, { ascending: sortOrder === "asc" })
        .range(skip, skip + pageSize - 1),
      countQuery,
    ]);

    if (dataRes.error) throw dataRes.error;
    if (countRes.error) throw countRes.error;

    const totalCount = countRes.count || 0;

    // Transform count payload format so that it has the expected `_count: { submissions: count }` structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (dataRes.data || []).map((user: any) => {
      const submissionsCount = user.waste_submissions?.[0]?.count || 0;
      return {
        ...user,
        _count: {
          submissions: submissionsCount,
        },
      };
    });

    return {
      users,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[getUsers Error]:", error);
    return {
      users: [],
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getUserById(id: string) {
  const supabase = await createServerClient();

  try {
    const [userRes, submissionsRes, redemptionsRes, ticketsRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("waste_submissions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("redemption_requests")
        .select("*, reward:rewards(*)")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (userRes.error) throw userRes.error;
    if (submissionsRes.error) throw submissionsRes.error;
    if (redemptionsRes.error) throw redemptionsRes.error;
    if (ticketsRes.error) throw ticketsRes.error;

    const user = userRes.data;
    if (!user) return null;

    // Map fields matching user page components expectations
    const mappedUser = {
      ...user,
      joinedAt: user.joined_at,
      wasteSubmitted: user.waste_submitted,
      submissions: submissionsRes.data || [],
      redemptions: (redemptionsRes.data || []).map((red: any) => ({
        ...red,
        createdAt: red.created_at,
      })),
      tickets: ticketsRes.data || [],
      _count: {
        submissions: (submissionsRes.data || []).length,
        redemptions: (redemptionsRes.data || []).length,
        tickets: (ticketsRes.data || []).length,
      },
    };

    const carbonSaved = mappedUser.wasteSubmitted * 0.5;

    return {
      ...mappedUser,
      carbonSaved,
    };
  } catch (error) {
    console.error("[getUserById Error]:", error);
    return null;
  }
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
  const supabase = await createServerClient();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("[updateUser Error]:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function adjustUserPoints(
  id: string,
  points: number,
  type: "add" | "subtract"
) {
  const supabase = await createServerClient();

  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newPoints =
      type === "add" ? user.points + points : Math.max(0, user.points - points);

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    revalidatePath("/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("[adjustUserPoints Error]:", error);
    return { success: false, error: "Failed to adjust user points" };
  }
}

export async function deleteUser(id: string) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("[deleteUser Error]:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  status?: string;
}) {
  const supabase = await createServerClient();

  try {
    // Generate UUID locally or let db generate it. But id is a references auth.users(id).
    // Let's create user.
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        ...data,
        status: data.status || "Active",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("[createUser Error]:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getCities() {
  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("city")
      .not("city", "is", null);

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueCities = Array.from(new Set(data.map((item: any) => item.city))).filter(Boolean);
    return uniqueCities;
  } catch (error) {
    console.error("[getCities Error]:", error);
    return [];
  }
}

export async function exportUsers(filters: UserFilters, format: "csv" | "excel" | "pdf") {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("users").select("*");

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      query = query.or(`name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal}`);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.city && filters.city !== "all") {
      query = query.eq("city", filters.city);
    }

    const { data: users, error } = await query.order("joined_at", { ascending: false });

    if (error) throw error;
    return users || [];
  } catch (error) {
    console.error("[exportUsers Error]:", error);
    return [];
  }
}

export async function bulkUpdateUserStatus(userIds: string[], status: string) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("users")
      .update({ status })
      .in("id", userIds);

    if (error) throw error;

    revalidatePath("/users");
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error("[bulkUpdateUserStatus Error]:", error);
    return { success: false, count: 0, error: "Failed to update users" };
  }
}

export async function bulkDeleteUsers(userIds: string[]) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .in("id", userIds);

    if (error) throw error;

    revalidatePath("/users");
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error("[bulkDeleteUsers Error]:", error);
    return { success: false, count: 0, error: "Failed to delete users" };
  }
}
