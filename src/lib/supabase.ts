import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

// 1. Browser client (run strictly on the client-side)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// 2. Server Action & Route Handler Client (read/write cookies)
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem(key: string) {
          return cookieStore.get(key)?.value ?? null;
        },
        setItem(key: string, value: string, options?: Record<string, unknown>) {
          try {
            cookieStore.set(key, value, options as any); // eslint-disable-line @typescript-eslint/no-explicit-any
          } catch {
            // Fails silently if cookies are set inside Server Components
          }
        },
        removeItem(key: string, options?: Record<string, unknown>) {
          try {
            cookieStore.delete({ name: key, ...options } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
          } catch {
            // Fails silently if cookies are deleted inside Server Components
          }
        },
      },
    },
  });
}

// 3. Service role client (bypasses RLS, for secure admin actions only)
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// 4. Middleware client (reads/writes cookies in the Next.js middleware)
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem(key: string) {
          return request.cookies.get(key)?.value ?? null;
        },
        setItem(key: string, value: string, options?: Record<string, unknown>) {
          response.cookies.set(key, value, options as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        removeItem(key: string, options?: Record<string, unknown>) {
          response.cookies.delete({ name: key, ...options } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      },
    },
  });
}
