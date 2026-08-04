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
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, svcKey);

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

async function main() {
  console.log('--- Checking Local Supabase DB Tables ---');

  const { data: years, error: yErr } = await supabase.from('committee_years').select('*');
  console.log('committee_years:', years, yErr?.message || '');

  const { data: roles, error: rErr } = await supabase.from('roles').select('*');
  console.log('roles count:', roles ? roles.length : 0, rErr?.message || '');
  console.log('roles:', roles);

  const { data: divs, error: dErr } = await supabase.from('divisions').select('*');
  console.log('divisions count:', divs ? divs.length : 0, dErr?.message || '');
}

main();
