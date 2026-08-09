const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const svcKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const DAREAN_EMAIL = 'dmardin@gmail.com';
const DAREAN_PASS = 'Pupapupa@123';
const DAREAN_NIM = 'F55124086';
const DAREAN_NAME = 'Dareean A. Raffi Mardin';

async function updateDaren() {
  console.log(`Setting up account for ${DAREAN_EMAIL}...`);

  // 1. Fetch divisions & roles
  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');
  
  const bphDiv = divisions.find(d => d.slug === 'bph')?.id;
  const picRole = roles.find(r => r.slug === 'pic')?.id;

  if (!bphDiv || !picRole) {
    console.error('Divisions/roles not found!');
    return;
  }

  // 2. Check if dareean@ifest.com exists -> remove or update it
  const { data: listData } = await supabase.auth.admin.listUsers();
  const oldUser = listData?.users?.find(u => u.email === 'dareean@ifest.com');
  if (oldUser) {
    console.log('Deleting old user dareean@ifest.com...');
    await supabase.auth.admin.deleteUser(oldUser.id);
  }

  // Check if dmardin@gmail.com already exists
  let darenUser = listData?.users?.find(u => u.email === DAREAN_EMAIL);
  if (darenUser) {
    console.log('Updating password for dmardin@gmail.com...');
    const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(darenUser.id, {
      password: DAREAN_PASS,
      email_confirm: true,
      user_metadata: { full_name: DAREAN_NAME, nim: DAREAN_NIM }
    });
    if (updateErr) console.error('Failed to update user:', updateErr.message);
  } else {
    console.log('Creating new user dmardin@gmail.com...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: DAREAN_EMAIL,
      password: DAREAN_PASS,
      email_confirm: true,
      user_metadata: { full_name: DAREAN_NAME, nim: DAREAN_NIM }
    });
    if (createErr) {
      console.error('Failed to create user:', createErr.message);
      return;
    }
    darenUser = created.user;
  }

  const userId = darenUser.id;
  console.log(`User ID for Daren: ${userId}`);

  // 3. Ensure Profile
  const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (!existingProfile) {
    const { error: profErr } = await supabase.from('profiles').insert({
      id: userId,
      full_name: DAREAN_NAME,
      nim: DAREAN_NIM
    });
    if (profErr) console.error('Profile error:', profErr.message);
    else console.log('Profile created for Daren!');
  } else {
    console.log('Profile already exists for Daren.');
  }

  // 4. Ensure Committee Assignment (bph as pic)
  const { data: existingAssign } = await supabase.from('committee_assignments').select('id').eq('committee_year_id', YEAR_ID).eq('user_id', userId).maybeSingle();
  if (!existingAssign) {
    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: YEAR_ID,
      user_id: userId,
      division_id: bphDiv,
      role_id: picRole
    });
    if (assignErr) console.error('Assignment error:', assignErr.message);
    else console.log('Committee assignment created for Daren (BPH / PIC)!');
  } else {
    console.log('Committee assignment already exists for Daren.');
  }

  console.log('\nSUCCESS! Account Daren updated to dmardin@gmail.com / Pupapupa@123');
}

updateDaren().catch(console.error);
