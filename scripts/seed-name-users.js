// ============================================================
// Seed user berbasis NAMA SUNGGUHAN (BPH, Koordinator & Wakil)
// Cara pakai: node scripts/seed-name-users.js
// Password default: ifest2026
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!svcKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const DEFAULT_PASSWORD = 'ifest2026';

const LEADER_ACCOUNTS = [
  // BPH (Pimpinan & Core BPH)
  { nama: 'Dareean A. Raffi Mardin', nim: 'F55124086', email: 'dareean@ifest.com', divisi: 'bph', role: 'pic' },
  { nama: 'Gabriel Kristofan', nim: 'F55124076', email: 'gabriel@ifest.com', divisi: 'bph', role: 'ketua-panitia' },
  { nama: 'Reyqal Syawalano', nim: 'F52124039', email: 'reyqal@ifest.com', divisi: 'bph', role: 'wakil-ketua' },
  { nama: 'Nakita Semesta', nim: 'F55124099', email: 'nakita@ifest.com', divisi: 'bph', role: 'ketua-panitia' },
  { nama: 'Nur Ainun', nim: 'F52124024', email: 'ainun@ifest.com', divisi: 'bph', role: 'sekretaris-1' },
  { nama: 'Yulianingsih', nim: 'F52124004', email: 'yulianingsih@ifest.com', divisi: 'bph', role: 'sekretaris-2' },
  { nama: 'Lara Fauzia', nim: 'F52124015', email: 'lara@ifest.com', divisi: 'bph', role: 'bendahara' },

  // Koordinator & Wakil Koordinator per Divisi
  { nama: 'Putri Intan A.', nim: 'F52124034', email: 'putri.intan@ifest.com', divisi: 'acara', role: 'koordinator' },
  { nama: 'Ahdayani Dwi Putri', nim: 'F55124016', email: 'ahdayani@ifest.com', divisi: 'acara', role: 'wakil-koordinator' },

  { nama: 'Febriansyah. H', nim: 'F52124044', email: 'febriansyah@ifest.com', divisi: 'humas', role: 'koordinator' },

  { nama: 'Moh. Fauzi R.', nim: 'F52124052', email: 'fauzi@ifest.com', divisi: 'sponsorship', role: 'koordinator' },

  { nama: 'Nur Amelia', nim: 'F52124017', email: 'amelia@ifest.com', divisi: 'kreativitas', role: 'koordinator' },

  { nama: 'Gaida Muthmainnah', nim: 'F52124023', email: 'gaida@ifest.com', divisi: 'ekonomi-kreatif', role: 'koordinator' },

  { nama: 'Salsabila', nim: 'F55124044', email: 'salsabila@ifest.com', divisi: 'konsumsi', role: 'koordinator' },

  { nama: 'Moh. Magribi R.', nim: 'F55124104', email: 'magribi@ifest.com', divisi: 'logistik', role: 'koordinator' },

  { nama: 'Moh. Nabil S.', nim: 'F55124079', email: 'nabil@ifest.com', divisi: 'lapangan', role: 'koordinator' },

  { nama: 'Ahmad Jayadi', nim: 'F52124002', email: 'jayadi@ifest.com', divisi: 'keamanan', role: 'koordinator' },
];

async function seed() {
  console.log('--- Seeding Akun BPH & Koordinator / Wakil ---');

  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');

  if (!divisions || !roles) {
    console.error('Gagal mengambil data divisi / roles dari Supabase.');
    process.exit(1);
  }

  const divMap = Object.fromEntries(divisions.map((d) => [d.slug, d.id]));
  const roleMap = Object.fromEntries(roles.map((r) => [r.slug, r.id]));

  for (const acc of LEADER_ACCOUNTS) {
    const divId = divMap[acc.divisi];
    const roleId = roleMap[acc.role];

    if (!divId) {
      console.error(`  ✗ Divisi "${acc.divisi}" tidak ditemukan untuk ${acc.nama}`);
      continue;
    }
    if (!roleId) {
      console.error(`  ✗ Role "${acc.role}" tidak ditemukan untuk ${acc.nama}`);
      continue;
    }

    let userId;

    // 1. Check or Create Auth User
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: acc.nama, nim: acc.nim },
    });

    if (createErr) {
      // Fetch user if already exists
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === acc.email);
      if (existing) {
        userId = existing.id;
        // Update password if existing
        await supabase.auth.admin.updateUserById(userId, { password: DEFAULT_PASSWORD });
      } else {
        console.error(`  ✗ Error membuat auth ${acc.email}: ${createErr.message}`);
        continue;
      }
    } else {
      userId = newUser.user.id;
    }

    // 2. Upsert Profile
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: acc.nama,
      nim: acc.nim,
    });

    // 3. Upsert Committee Assignment
    const { data: existingAssignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingAssignment) {
      await supabase
        .from('committee_assignments')
        .update({ division_id: divId, role_id: roleId, is_active: true })
        .eq('id', existingAssignment.id);
    } else {
      await supabase.from('committee_assignments').insert({
        committee_year_id: YEAR_ID,
        user_id: userId,
        division_id: divId,
        role_id: roleId,
        is_active: true,
      });
    }

    console.log(`✓ ${acc.email} (${acc.nama}) → Divisi: ${acc.divisi}, Role: ${acc.role}`);
  }

  console.log('\nSelesai! Semua akun pimpinan, koordinator, & wakil koordinator berhasil dibuat/diperbarui.');
}

seed().catch(console.error);
