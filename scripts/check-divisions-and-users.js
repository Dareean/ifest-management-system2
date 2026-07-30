const { createClient } = require('@supabase/supabase-js');

const NEXT_PUBLIC_SUPABASE_URL = 'https://xxmxbyiggrottreetrig.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';

const admin = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function main() {
  console.log('--- Checking Divisions ---');
  const { data: divs, error: divErr } = await admin
    .from('divisions')
    .select('id, name, slug, supervisor_id');
  if (divErr) console.error(divErr);
  else console.log(divs);

  console.log('\n--- Checking BPH Members & Assignments ---');
  const { data: ass, error: assErr } = await admin
    .from('committee_assignments')
    .select(`
      id,
      profiles!committee_assignments_user_id_fkey (full_name, nim),
      divisions!committee_assignments_division_id_fkey (name, slug),
      roles!committee_assignments_role_id_fkey (name, slug, level)
    `);
  if (assErr) console.error(assErr);
  else {
    ass.forEach(a => {
      console.log(`- ${a.profiles?.full_name} (${a.profiles?.nim}): Divisi [${a.divisions?.name}] as [${a.roles?.name}] (level ${a.roles?.level})`);
    });
  }
}

main().catch(console.error);
