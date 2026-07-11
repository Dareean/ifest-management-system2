const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

async function main() {
  console.log('--- Checking letter_requests schema ---');
  const { data: colCheck, error: colError } = await supabase
    .from('letter_requests')
    .select('id, category')
    .limit(1);
    
  if (colError) {
    console.log('Error querying category column:', colError.message);
  } else {
    console.log('Category column exists! Sample row:', colCheck);
  }

  console.log('\n--- Checking Roles and Assignments ---');
  const { data: assignments, error: assignError } = await supabase
    .from('committee_assignments')
    .select(`
      id,
      profiles (full_name, nim),
      divisions (name, slug),
      roles (name, slug)
    `);

  if (assignError) {
    console.error('Error fetching assignments:', assignError.message);
  } else {
    console.log(`Found ${assignments.length} assignments:`);
    assignments.forEach(a => {
      console.log(`- ${a.profiles?.full_name} (${a.profiles?.nim}): Divisi [${a.divisions?.name}] as [${a.roles?.name}]`);
    });
  }
}

main().catch(console.error);
