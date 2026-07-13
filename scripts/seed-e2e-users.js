const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.TEST_SUPABASE_URL || 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = process.env.TEST_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';

const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

const testUsers = [
  {
    email: 'admin@test.ifest.local',
    password: 'TestAdmin123!',
    nama: 'Admin Test',
    nim: 'E2E-ADMIN',
    divisi: 'bph',
    role: 'pic'
  },
  {
    email: 'sekretaris@test.ifest.local',
    password: 'TestSekretaris123!',
    nama: 'Sekretaris Test',
    nim: 'E2E-SEKRETARIS',
    divisi: 'bph',
    role: 'sekretaris-1'
  },
  {
    email: 'member@test.ifest.local',
    password: 'TestMember123!',
    nama: 'Member Test',
    nim: 'E2E-MEMBER',
    divisi: 'acara',
    role: 'anggota'
  }
];

async function seed() {
  console.log('Fetching divisions and roles...');
  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');

  if (!divisions || !roles) {
    console.error('Failed to fetch divisions/roles');
    return;
  }

  const divMap = Object.fromEntries(divisions.map(d => [d.slug, d.id]));
  const roleMap = Object.fromEntries(roles.map(r => [r.slug, r.id]));

  for (const user of testUsers) {
    console.log(`Processing E2E user: ${user.nama} (${user.email})...`);

    const divId = divMap[user.divisi];
    const roleId = roleMap[user.role];

    if (!divId) {
      console.error(`✗ Divisi "${user.divisi}" not found`);
      continue;
    }
    if (!roleId) {
      console.error(`✗ Role "${user.role}" not found`);
      continue;
    }

    // Check if auth user already exists, if so delete them first to reset
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find(u => u.email === user.email);
    if (existing) {
      console.log(`~ Existing auth user found with ID: ${existing.id}. Deleting for reset...`);
      await supabase.auth.admin.deleteUser(existing.id);
    }

    // Create auth user
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.nama, nim: user.nim }
    });

    if (createErr || !newUser?.user) {
      console.error(`✗ Failed to create auth user: ${createErr?.message || 'unknown error'}`);
      continue;
    }

    const authUserId = newUser.user.id;
    console.log(`✓ Created auth user with ID: ${authUserId}`);

    // Check/create profile (trigger might have created it, but let's upsert to be safe)
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: authUserId,
      full_name: user.nama,
      nim: user.nim
    });

    if (profileErr) {
      console.error(`✗ Failed to upsert profile: ${profileErr.message}`);
      continue;
    }
    console.log(`✓ Upserted profile`);

    // Insert committee assignment
    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: YEAR_ID,
      user_id: authUserId,
      division_id: divId,
      role_id: roleId,
      is_active: true
    });

    if (assignErr) {
      console.error(`✗ Failed to create assignment: ${assignErr.message}`);
    } else {
      console.log(`✓ Created assignment successfully: ${user.divisi} as ${user.role}`);
    }
  }

  console.log('\nSeeding E2E users finished!');
}

seed().catch(console.error);
