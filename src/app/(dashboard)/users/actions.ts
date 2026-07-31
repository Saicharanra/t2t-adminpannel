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
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["user", "viewer", "regional_admin"]),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["user", "viewer", "regional_admin"]).eq("status", "active"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["user", "viewer", "regional_admin"]).gte("created_at", today.toISOString()),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["user", "viewer", "regional_admin"]).not("email", "is", null),
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

    // Convert legacy/camelCase sorting fields
    let dbSortBy = sortBy === "joinedAt" || sortBy === "joined_at" ? "created_at" : sortBy;
    if (dbSortBy === "points") dbSortBy = "reward_points_balance";
    if (dbSortBy === "wasteSubmitted") dbSortBy = "total_waste_kg";

    // Build query
    let query = supabase.from("users").select("*, profile:profiles!inner(*, city:cities(name)), waste_submissions(count)");

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.search)) {
        query = query.eq("id", filters.search);
      } else {
        query = query.or(`full_name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal}`, { foreignTable: 'profile' });
      }
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase());
    }

    if (filters.city && filters.city !== "all") {
      // filtering deeply on outer join might not be directly supported without a view or rpc
      // For now, if someone filters by city, we do nothing as the users table has no city_id directly.
      // Wait, let's just let it run. PostgREST handles some forms of nested equality? 
      // Actually we proved profile.city.name eq Mumbai didn't throw an error!
      query = query.eq("profile.city.name", filters.city);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", new Date(filters.dateFrom).toISOString());
    }

    if (filters.dateTo) {
      query = query.lte("created_at", new Date(filters.dateTo).toISOString());
    }

    if (filters.pointsMin !== undefined) {
      query = query.gte("reward_points_balance", filters.pointsMin);
    }

    if (filters.pointsMax !== undefined) {
      query = query.lte("reward_points_balance", filters.pointsMax);
    }

    // Clone query for count calculation
    let countQuery = supabase.from("users").select("*, profile:profiles!inner(*, city:cities(name))", { count: "exact", head: true });
    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.search)) {
        countQuery = countQuery.eq("id", filters.search);
      } else {
        countQuery = countQuery.or(`full_name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal}`, { foreignTable: 'profile' });
      }
    }
    if (filters.status && filters.status !== "all") countQuery = countQuery.eq("status", filters.status.toLowerCase());
    if (filters.city && filters.city !== "all") countQuery = countQuery.eq("profile.city.name", filters.city);
    if (filters.dateFrom) countQuery = countQuery.gte("created_at", new Date(filters.dateFrom).toISOString());
    if (filters.dateTo) countQuery = countQuery.lte("created_at", new Date(filters.dateTo).toISOString());
    if (filters.pointsMin !== undefined) countQuery = countQuery.gte("reward_points_balance", filters.pointsMin);
    if (filters.pointsMax !== undefined) countQuery = countQuery.lte("reward_points_balance", filters.pointsMax);

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
        id: user.id,
        name: user.profile?.full_name || "Unknown User",
        email: user.profile?.email || "",
        phone: user.profile?.phone || null,
        city: user.profile?.city?.name || null,
        status: user.status,
        points: user.reward_points_balance || 0,
        wasteSubmitted: user.total_waste_kg || 0,
        joinedAt: user.created_at,
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
      supabase.from("users").select("*, profile:profiles(*, city:cities(name))").eq("id", id).maybeSingle(),
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
      id: user.id,
      name: user.profile?.full_name || "Unknown User",
      email: user.profile?.email || "",
      phone: user.profile?.phone || null,
      city: user.profile?.city?.name || null,
      status: user.status,
      points: user.reward_points_balance || 0,
      joinedAt: user.created_at,
      wasteSubmitted: user.total_waste_kg || 0,
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
    const profileUpdate: any = {};
    if (data.name !== undefined) profileUpdate.full_name = data.name;
    if (data.email !== undefined) profileUpdate.email = data.email;
    if (data.phone !== undefined) profileUpdate.phone = data.phone;
    if (data.status !== undefined) profileUpdate.status = data.status.toLowerCase();

    // Finding city ID from string
    if (data.city !== undefined && data.city !== null && data.city !== "all") {
       const { data: cityData } = await supabase.from('cities').select('id').eq('name', data.city).maybeSingle();
       if (cityData) profileUpdate.city_id = cityData.id;
    }

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("profiles").update(profileUpdate).eq("id", id);
    }

    const userUpdate: any = {};
    if (data.status !== undefined) userUpdate.status = data.status.toLowerCase();
    
    let updatedUser = null;
    if (Object.keys(userUpdate).length > 0) {
      const { data: u, error } = await supabase.from("users").update(userUpdate).eq("id", id).select().single();
      if (error) throw error;
      updatedUser = u;
    }

    revalidatePath("/users");
    return { success: true, user: updatedUser };
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
      .select("reward_points_balance")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newPoints =
      type === "add" ? user.reward_points_balance + points : Math.max(0, user.reward_points_balance - points);

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ reward_points_balance: newPoints })
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
  console.error("[createUser Error]: Creation of users should happen via Auth system first.");
  return { success: false, error: "Users must be created through the Auth system." };
}

export async function getCities() {
  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase
      .from("cities")
      .select("name");

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueCities = Array.from(new Set(data.map((item: any) => item.name))).filter(Boolean);
    return uniqueCities;
  } catch (error) {
    console.error("[getCities Error]:", error);
    return [];
  }
}

export async function exportUsers(filters: UserFilters, format: "csv" | "excel" | "pdf") {
  const supabase = await createServerClient();

  try {
    let query = supabase.from("users").select("*, profile:profiles!inner(*, city:cities(name))");

    if (filters.search) {
      const searchVal = `%${filters.search}%`;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.search)) {
        query = query.eq("id", filters.search);
      } else {
        query = query.or(`full_name.ilike.${searchVal},email.ilike.${searchVal},phone.ilike.${searchVal}`, { foreignTable: 'profile' });
      }
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase());
    }

    if (filters.city && filters.city !== "all") {
      query = query.eq("profile.city.name", filters.city);
    }

    const { data: usersData, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    
    const users = (usersData || []).map((user: any) => ({
      id: user.id,
      name: user.profile?.full_name || "Unknown User",
      email: user.profile?.email || "",
      phone: user.profile?.phone || null,
      city: user.profile?.city?.name || null,
      status: user.status,
      points: user.reward_points_balance || 0,
      wasteSubmitted: user.total_waste_kg || 0,
      joinedAt: user.created_at
    }));

    return users;
  } catch (error) {
    console.error("[exportUsers Error]:", error);
    return [];
  }
}

export async function bulkUpdateUserStatus(userIds: string[], status: string) {
  const supabase = await createServerClient();

  try {
    const { error: pError } = await supabase
      .from("profiles")
      .update({ status: status.toLowerCase() })
      .in("id", userIds);
      
    if (pError) throw pError;

    const { error } = await supabase
      .from("users")
      .update({ status: status.toLowerCase() })
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
