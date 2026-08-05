import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const DEFAULT_URL = "https://xxmxbyiggrottreetrig.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw";

export async function createClient() {
  const cookieStore = await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : DEFAULT_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : DEFAULT_KEY;

  return createServerClient<Database>(
    url,
    key,
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
