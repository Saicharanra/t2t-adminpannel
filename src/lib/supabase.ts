import { createClient } from "./supabase/client";

export const supabase = createClient();
export default supabase;
export * from "./supabase/client";
export * from "./supabase/types";
