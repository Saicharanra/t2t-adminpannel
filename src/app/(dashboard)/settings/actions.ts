"use server";

import { createAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { DEFAULT_SETTINGS, SystemSettingItem } from "./constants";

/**
 * Fetches all system settings from Supabase `system_settings` table.
 * If empty or partial, merges with DEFAULT_SETTINGS.
 */
export async function getSystemSettings(): Promise<{
  success: boolean;
  settings: Record<string, Record<string, any>>;
  totalKeys: number;
  lastUpdated?: string;
  error?: string;
}> {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*");

    if (error) {
      console.warn("[getSystemSettings DB Warning]:", error.message);
      // Fall back to default settings if table query fails
      return {
        success: true,
        settings: DEFAULT_SETTINGS,
        totalKeys: Object.keys(DEFAULT_SETTINGS).length,
      };
    }

    const mergedSettings: Record<string, Record<string, any>> = { ...DEFAULT_SETTINGS };
    let maxUpdatedAt: string | undefined = undefined;

    if (data && Array.isArray(data)) {
      data.forEach((item: SystemSettingItem) => {
        if (item.key && item.value) {
          mergedSettings[item.key] = {
            ...(DEFAULT_SETTINGS[item.key] || {}),
            ...item.value,
          };
          if (item.updated_at && (!maxUpdatedAt || item.updated_at > maxUpdatedAt)) {
            maxUpdatedAt = item.updated_at;
          }
        }
      });
    }

    return {
      success: true,
      settings: mergedSettings,
      totalKeys: Object.keys(mergedSettings).length,
      lastUpdated: maxUpdatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("[getSystemSettings Catch]:", err);
    return {
      success: true,
      settings: DEFAULT_SETTINGS,
      totalKeys: Object.keys(DEFAULT_SETTINGS).length,
    };
  }
}

/**
 * Updates a single setting category key in `system_settings` table.
 */
export async function updateSystemSetting(
  key: string,
  value: Record<string, any>
): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    const description = `Setting configuration for category: ${key}`;
    const updatedAt = new Date().toISOString();

    const { error } = await supabase
      .from("system_settings")
      .upsert(
        {
          key,
          value,
          description,
          updated_at: updatedAt,
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("[updateSystemSetting DB Error]:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, message: `Configuration updated successfully!` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return { success: false, error: msg };
  }
}

/**
 * Resets all settings back to DEFAULT_SETTINGS
 */
export async function resetSystemSettings(): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabase = createAdminClient();

  try {
    const keys = Object.keys(DEFAULT_SETTINGS);
    const rowsToUpsert = keys.map((key) => ({
      key,
      value: DEFAULT_SETTINGS[key],
      description: `Default setting configuration for category: ${key}`,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("system_settings").upsert(rowsToUpsert, { onConflict: "key" });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true, message: "All system settings reset to default values!" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reset settings";
    return { success: false, error: msg };
  }
}
