// ============================================================
// Seed user untuk SUPABASE LOKAL (dev/login)
// Cara pakai: node scripts/seed-local-users.js
// Mengambil kredensial dari .env.local (harus DB LOKAL).
// ============================================================
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !svcKey) {
  console.error('Missing credentials. Pastikan .env.local menunjuk ke SUPABASE LOKAL.');
  process.exit(1);
}
if (!supabaseUrl.includes('127.0.0.1') && !supabaseUrl.includes('localhost')) {
  console.error(`TOLAK: .env.local menunjuk ke ${supabaseUrl}. Script ini HANYA untuk DB lokal.`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const users = [
  {
    email: 'admin@local.ifest',
    password: 'LocalAdmin123!',
    nama: 'Admin Lokal',
    nim: 'LOCAL-ADMIN',
    divisi: 'bph',
    role: 'pic',
  },
  {
    email: 'sekretaris@local.ifest',
    password: 'LocalSekretaris123!',
    nama: 'Sekretaris Lokal',
    nim: 'LOCAL-SEKRETARIS',
    divisi: 'bph',
    role: 'sekretaris-1',
  },
  {
    email: 'anggota@local.ifest',
    password: 'LocalAnggota123!',
    nama: 'Anggota Lokal',
    nim: 'LOCAL-ANGGOTA',
    divisi: 'acara',
    role: 'anggota',
  },
];

async function seed() {
  const { data: year } = await supabase
    .from('committee_years')
    .select('id')
    .eq('is_active', true)
    .single();
  if (!year) throw new Error('Tidak ada committee_years aktif di DB lokal. Jalankan `supabase db reset` dulu.');
  const yearId = year.id;

  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');
  const divMap = Object.fromEntries(divisions.map((d) => [d.slug, d.id]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.slug, r.id]));

  for (const u of users) {
    const divId = divMap[u.divisi];
    const roleId = roleMap[u.role];
    if (!divId || !roleId) {
      console.error(`✗ Divisi/role "${u.divisi}/${u.role}" tidak ditemukan`);
      continue;
    }

    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((x) => x.email === u.email);
    if (existing) {
      console.log(`~ Hapus user lama ${u.email}...`);
      await supabase.auth.admin.deleteUser(existing.id);
    }

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.nama, nim: u.nim },
    });
    if (createErr || !newUser?.user) {
      console.error(`✗ Gagal buat ${u.email}: ${createErr?.message}`);
      continue;
    }

    await supabase.from('profiles').upsert({
      id: newUser.user.id,
      full_name: u.nama,
      nim: u.nim,
    });

    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: yearId,
      user_id: newUser.user.id,
      division_id: divId,
      role_id: roleId,
      is_active: true,
    });
    if (assignErr) console.error(`✗ Gagal assignment ${u.email}: ${assignErr.message}`);
    else console.log(`✓ ${u.email} (${u.divisi}/${u.role})`);
  }

  console.log('\nSelesai. Login di http://localhost:3000 dengan salah satu akun di atas.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
