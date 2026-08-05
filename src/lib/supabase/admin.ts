import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://xxmxbyiggrottreetrig.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw";

export function createAdminClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : DEFAULT_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : DEFAULT_KEY;

  return createClient(url, key, { auth: { persistSession: false } });
}

