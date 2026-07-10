const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

const personel = [
  // BPH
  { nama: 'Dareean A. Raffi Mardin', nim: 'F55124086', email: 'dareean@example.com', divisi: 'bph', role: 'pic' },
  { nama: 'Gabriel Kristofan', nim: 'F55124076', email: 'gabriel@example.com', divisi: 'bph', role: 'ketua-panitia' },
  { nama: 'Reyqal Syawalano', nim: 'F52124039', email: 'reyqal@example.com', divisi: 'bph', role: 'wakil-ketua' },
  { nama: 'Nur Ainun', nim: 'F52124024', email: 'ainun@example.com', divisi: 'bph', role: 'sekretaris-1' },
  { nama: 'Yulianingsih', nim: 'F52124004', email: 'yulianingsih@example.com', divisi: 'bph', role: 'sekretaris-2' },
  { nama: 'Lara Fauzia', nim: 'F52124015', email: 'lara@example.com', divisi: 'bph', role: 'bendahara' },
  // Acara
  { nama: 'Putri Intan A.', nim: 'F52124034', email: 'putri.intan@example.com', divisi: 'acara', role: 'koordinator' },
  // Humas
  { nama: 'Febriansyah. H', nim: 'F52124044', email: 'febriansyah@example.com', divisi: 'humas', role: 'koordinator' },
  // Sponsorship
  { nama: 'Moh. Fauzi R.', nim: 'F52124052', email: 'fauzi@example.com', divisi: 'sponsorship', role: 'koordinator' },
  // Kreativitas
  { nama: 'Nur Amelia', nim: 'F52124017', email: 'amelia@example.com', divisi: 'kreativitas', role: 'koordinator' },
  // Ekonomi Kreatif
  { nama: 'Gaida Muthmainnah', nim: 'F52124023', email: 'gaida@example.com', divisi: 'ekonomi-kreatif', role: 'koordinator' },
  // Konsumsi
  { nama: 'Salsabila', nim: 'F55124044', email: 'salsabila@example.com', divisi: 'konsumsi', role: 'koordinator' },
  // Logistik
  { nama: 'Moh. Magribi R.', nim: 'F55124104', email: 'magribi@example.com', divisi: 'logistik', role: 'koordinator' },
  // Lapangan
  { nama: 'Moh. Nabil S.', nim: 'F55124079', email: 'nabil@example.com', divisi: 'lapangan', role: 'koordinator' },
  // Keamanan
  { nama: 'Ahmad Jayadi', nim: 'F52124002', email: 'jayadi@example.com', divisi: 'keamanan', role: 'koordinator' },
  // Extra members
  { nama: 'Anggota Acara 1', nim: 'F55124001', email: 'acara1@example.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Anggota Acara 2', nim: 'F55124002', email: 'acara2@example.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Anggota Humas 1', nim: 'F55124003', email: 'humas1@example.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Anggota Kreativitas 1', nim: 'F55124004', email: 'kreatif1@example.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Anggota Sponsorship 1', nim: 'F55124005', email: 'sponsor1@example.com', divisi: 'sponsorship', role: 'anggota' },
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

  console.log(`Found ${divisions.length} divisions, ${roles.length} roles`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of personel) {
    const divId = divMap[p.divisi];
    const roleId = roleMap[p.role];

    if (!divId) { console.error(`  ✗ Divisi "${p.divisi}" not found`); errors++; continue; }
    if (!roleId) { console.error(`  ✗ Role "${p.role}" not found`); errors++; continue; }

    // Check if profile exists by NIM (profiles use UUID id)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('nim', p.nim)
      .maybeSingle();

    let profileId;

    if (existingProfile) {
      profileId = existingProfile.id;
    } else {
      // Create profile with a generated UUID
      const newId = randomUUID();
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({
          id: newId,
          full_name: p.nama,
          nim: p.nim,
        });

      if (profileErr) {
        console.error(`  ✗ ${p.nama}: ${profileErr.message}`);
        errors++;
        continue;
      }
      profileId = newId;
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('user_id', profileId)
      .maybeSingle();

    if (existingAssignment) {
      console.log(`  ~ ${p.nama} — already assigned`);
      skipped++;
      continue;
    }

    const { error: assignErr } = await supabase
      .from('committee_assignments')
      .insert({
        committee_year_id: YEAR_ID,
        user_id: profileId,
        division_id: divId,
        role_id: roleId,
      });

    if (assignErr) {
      console.error(`  ✗ ${p.nama}: ${assignErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${p.nama} (${p.nim}) → ${p.divisi} as ${p.role}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} created, ${skipped} skipped, ${errors} errors`);
}

seed().catch(console.error);
