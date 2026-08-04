// ============================================================
// Seed user untuk SUPABASE LOKAL (dev/login)
// Cara pakai: node scripts/seed-local-users.js
// Mengambil kredensial dari .env.local (harus DB LOKAL).
//
// Akun:
//  - Core BPH : admin@ifest.com, sekretaris@ifest.com, bendahara@ifest.com
//  - Per divisi: <slug>koor@ifest.com (role koordinator) &
//                <slug>anggota@ifest.com (role anggota)
//  Semua password default: ifest2026
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

// ID harus sama dengan YEAR_ID yang di-hardcode aplikasi
const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

const CORE = [
  { email: 'admin@ifest.com', nama: 'Admin I-FEST', nim: 'LOCAL-ADMIN', divisi: 'bph', role: 'pic' },
  { email: 'sekretaris@ifest.com', nama: 'Sekretaris I-FEST', nim: 'LOCAL-SEKRETARIS', divisi: 'bph', role: 'sekretaris-1' },
  { email: 'bendahara@ifest.com', nama: 'Bendahara I-FEST', nim: 'LOCAL-BENDAHARA', divisi: 'bph', role: 'bendahara' },
];

async function seed() {
  const { data: year, error: yearErr } = await supabase
    .from('committee_years')
    .select('id')
    .eq('id', YEAR_ID)
    .single();
  if (yearErr || !year) {
    console.error('committee_years dengan ID c2f2a48e-... tidak ada. Jalankan `supabase db reset` dulu.');
    process.exit(1);
  }

  const { data: divisions } = await supabase.from('divisions').select('id,slug,name');
  const { data: roles } = await supabase.from('roles').select('id,slug');
  const divMap = Object.fromEntries(divisions.map((d) => [d.slug, d.id]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.slug, r.id]));

  // Bangun daftar akun: core + koor/anggota per divisi
  const users = [...CORE];
  for (const d of divisions) {
    if (d.slug === 'bph') continue; // BPH sudah diwakili core (admin/sekretaris/bendahara)
    // nim wajib <= 20 char (kolom profiles.nim VARCHAR(20))
    const nimKoor = `L-${d.slug}-K`.slice(0, 20);
    const nimAng = `L-${d.slug}-A`.slice(0, 20);
    users.push(
      {
        email: `${d.slug}koor@ifest.com`,
        nama: `Koordinator Divisi ${d.name}`,
        nim: nimKoor,
        divisi: d.slug,
        role: 'koordinator',
      },
      {
        email: `${d.slug}anggota@ifest.com`,
        nama: `Anggota Divisi ${d.name}`,
        nim: nimAng,
        divisi: d.slug,
        role: 'anggota',
      },
    );
  }

  const { data: allUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingByEmail = new Map((allUsers?.users ?? []).map((x) => [x.email, x]));

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const u of users) {
    const divId = divMap[u.divisi];
    const roleId = roleMap[u.role];
    if (!divId || !roleId) {
      console.error(`✗ Divisi/role "${u.divisi}/${u.role}" tidak ditemukan`);
      continue;
    }
    const existing = existingByEmail.get(u.email);
    if (existing) {
      await supabase.auth.admin.deleteUser(existing.id);
      await sleep(200);
    }

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'ifest2026',
      email_confirm: true,
      user_metadata: { full_name: u.nama, nim: u.nim },
    });
    if (createErr || !newUser?.user) {
      console.error(`✗ Gagal buat ${u.email}: ${JSON.stringify(createErr)}`);
      continue;
    }

    await supabase.from('profiles').upsert({
      id: newUser.user.id,
      full_name: u.nama,
      nim: u.nim,
    });

    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: YEAR_ID,
      user_id: newUser.user.id,
      division_id: divId,
      role_id: roleId,
      is_active: true,
    });
    if (assignErr) console.error(`✗ Gagal assignment ${u.email}: ${assignErr.message}`);
    else console.log(`✓ ${u.email} (${u.divisi}/${u.role})`);
    await sleep(150);
  }

  console.log(`\nSelesai: ${users.length} akun. Login di http://localhost:3000 (password: ifest2026).`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});