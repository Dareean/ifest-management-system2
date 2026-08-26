import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from "./config";

export function resolveSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url || url === "https://placeholder.supabase.co") {
    return DEFAULT_SUPABASE_URL;
  }
  return url;
}

export function resolveSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key || key === "placeholder-anon-key") {
    return DEFAULT_SUPABASE_ANON_KEY;
  }
  return key;
}

export function createClient() {
  return createBrowserClient<Database>(
    resolveSupabaseUrl(),
    resolveSupabaseAnonKey(),
  );
}
