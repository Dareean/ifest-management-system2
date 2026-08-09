const { createClient } = require('@supabase/supabase-js');

const url = 'https://boyqfogjqpxbijlavirw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXFmb2dqcXB4YmlqbGF2aXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI3NTMzMCwiZXhwIjoyMTAxODUxMzMwfQ.i4CzDtPgaqS_wjPmrQ8GdtaLCOh0s10fehraK5-1PI0';

const supabase = createClient(url, serviceKey);

async function check() {
  console.log('Testing connection to Cloud Dev DB (boyqfogjqpxbijlavirw)...');
  const { data: divisions, error } = await supabase.from('divisions').select('id, name, slug').limit(5);
  
  if (error) {
    console.log('Error querying divisions (schema might not be applied yet):', error.message);
  } else {
    console.log('Successfully connected! Divisions count:', divisions.length);
    console.log('Sample divisions:', divisions);
  }
}

check();
