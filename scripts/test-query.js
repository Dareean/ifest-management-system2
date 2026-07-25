const { createClient } = require('@supabase/supabase-js');

const NEXT_PUBLIC_SUPABASE_URL = 'https://xxmxbyiggrottreetrig.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const userId = '7770b377-481d-4eb4-917e-95f22b9b5387'; // Daren's profile ID

const admin = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  const { data, error } = await admin
    .from('committee_assignments')
    .select('id, division_id, role:roles(name, slug, level), division:divisions!committee_assignments_division_id_fkey(id, name)')
    .eq('committee_year_id', YEAR_ID)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

main();
