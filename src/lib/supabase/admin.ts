import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_URL } from "./config";

/**
 * Admin client (service role) — melewati RLS.
 *
 * PENTING: service-role key HANYA boleh ada di environment server
 * (Vercel server env / .env.local yang tidak ter-commit). Kalau key ini
 * tidak tersedia, JANGAN pernah fallback diam-diam ke anon key: semua
 * query admin akan gagal karena RLS dan autentikasi halaman ikut rusak.
 * Sebaliknya, lempar error yang jelas agar pemanggil bisa fallback
 * ke user-scoped client (RLS) — lihat lib/auth/authorize.ts.
 */
export function createAdminClient(): SupabaseClient {
  const url = resolveSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key || key === "placeholder-service-role-key") {
    throw new Error(
      "[admin.ts] SUPABASE_SERVICE_ROLE_KEY tidak tersedia di environment ini. " +
        "Gunakan fallback user-scoped client (RLS) atau set env var tersebut.",
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/** True kalau service-role key benar-benar tersedia. */
export function hasServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(key && key !== "placeholder-service-role-key");
}

function resolveSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url || url === "https://placeholder.supabase.co") {
    return DEFAULT_SUPABASE_URL;
  }
  return url;
}
