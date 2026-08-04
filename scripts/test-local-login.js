const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(fileName) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !key.startsWith('#') && !process.env[key]) process.env[key] = val;
    }
  });
}

loadEnv('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing login against:', supabaseUrl);

const supabase = createClient(supabaseUrl, anonKey);
const adminSupabase = createClient(supabaseUrl, svcKey);

async function main() {
  console.log('\n--- Checking auth.users list ---');
  const { data: usersData, error: listErr } = await adminSupabase.auth.admin.listUsers();
  if (listErr) console.error('List users error:', listErr);
  else {
    console.log(`Total users in DB: ${usersData.users.length}`);
    usersData.users.forEach(u => console.log(` - ${u.email} (confirmed: ${u.email_confirmed_at})`));
  }

  console.log('\n--- Attempting signInWithPassword for dareean@ifest.com ---');
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: 'dareean@ifest.com',
    password: 'ifest2026',
  });

  if (loginErr) {
    console.error('Login failed:', loginErr.message);
  } else {
    console.log('Login SUCCESS! User ID:', loginData.user.id);
  }
}

main();
