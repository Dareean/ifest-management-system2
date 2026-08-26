import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "./config";
import { resolveSupabaseUrl, resolveSupabaseAnonKey } from "./client";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    resolveSupabaseUrl(),
    resolveSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

export { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY };
