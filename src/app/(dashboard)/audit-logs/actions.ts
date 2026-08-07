"use server";

import { createAdminClient } from "@/lib/supabase";

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_entity: string | null;
  target_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: Record<string, any> | null;
  created_at: string;
}

export async function getAuditLogs(options?: {
  search?: string;
  targetEntity?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  logs: AuditLogRecord[];
  totalCount: number;
  stats: {
    totalLogs: number;
    actionsToday: number;
    uniqueEntities: number;
    uniqueActors: number;
  };
  error?: string;
}> {
  const supabase = createAdminClient();

  try {
    const limit = options?.limit || 100;

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (options?.targetEntity && options.targetEntity !== "ALL") {
      query = query.eq("target_entity", options.targetEntity.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getAuditLogs Error]:", error);
      return {
        success: false,
        logs: [],
        totalCount: 0,
        stats: { totalLogs: 0, actionsToday: 0, uniqueEntities: 0, uniqueActors: 0 },
        error: error.message,
      };
    }

    let logs: AuditLogRecord[] = data || [];

    // Client-side search filtering if query present
    if (options?.search && options.search.trim() !== "") {
      const q = options.search.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.action.toLowerCase().includes(q) ||
          (log.target_entity && log.target_entity.toLowerCase().includes(q)) ||
          (log.ip_address && log.ip_address.includes(q)) ||
          (log.payload && JSON.stringify(log.payload).toLowerCase().includes(q))
      );
    }

    // Calculate statistics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const actionsToday = logs.filter((l) => l.created_at >= startOfToday).length;
    const uniqueEntities = new Set(logs.map((l) => l.target_entity).filter(Boolean)).size;
    const uniqueActors = new Set(logs.map((l) => l.actor_id).filter(Boolean)).size;

    return {
      success: true,
      logs,
      totalCount: logs.length,
      stats: {
        totalLogs: logs.length,
        actionsToday,
        uniqueEntities,
        uniqueActors,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch audit logs";
    return {
      success: false,
      logs: [],
      totalCount: 0,
      stats: { totalLogs: 0, actionsToday: 0, uniqueEntities: 0, uniqueActors: 0 },
      error: msg,
    };
  }
}
