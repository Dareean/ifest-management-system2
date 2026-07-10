const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const DEFAULT_PASSWORD = 'ifest2026';

const personel = [
  { nama: 'Dareean A. Raffi Mardin', nim: 'F55124086', email: 'dareean@hmti.untad.ac.id', divisi: 'bph', role: 'pic' },
  { nama: 'Gabriel Kristofan', nim: 'F55124076', email: 'gabriel@hmti.untad.ac.id', divisi: 'bph', role: 'ketua-panitia' },
  { nama: 'Reyqal Syawalano', nim: 'F52124039', email: 'reyqal@hmti.untad.ac.id', divisi: 'bph', role: 'wakil-ketua' },
  { nama: 'Nur Ainun', nim: 'F52124024', email: 'ainun@hmti.untad.ac.id', divisi: 'bph', role: 'sekretaris-1' },
  { nama: 'Yulianingsih', nim: 'F52124004', email: 'yulianingsih@hmti.untad.ac.id', divisi: 'bph', role: 'sekretaris-2' },
  { nama: 'Lara Fauzia', nim: 'F52124015', email: 'lara@hmti.untad.ac.id', divisi: 'bph', role: 'bendahara' },
  { nama: 'Putri Intan A.', nim: 'F52124034', email: 'putri.intan@hmti.untad.ac.id', divisi: 'acara', role: 'koordinator' },
  { nama: 'Febriansyah. H', nim: 'F52124044', email: 'febriansyah@hmti.untad.ac.id', divisi: 'humas', role: 'koordinator' },
  { nama: 'Moh. Fauzi R.', nim: 'F52124052', email: 'fauzi@hmti.untad.ac.id', divisi: 'sponsorship', role: 'koordinator' },
  { nama: 'Nur Amelia', nim: 'F52124017', email: 'amelia@hmti.untad.ac.id', divisi: 'kreativitas', role: 'koordinator' },
  { nama: 'Gaida Muthmainnah', nim: 'F52124023', email: 'gaida@hmti.untad.ac.id', divisi: 'ekonomi-kreatif', role: 'koordinator' },
  { nama: 'Salsabila', nim: 'F55124044', email: 'salsabila@hmti.untad.ac.id', divisi: 'konsumsi', role: 'koordinator' },
  { nama: 'Moh. Magribi R.', nim: 'F55124104', email: 'magribi@hmti.untad.ac.id', divisi: 'logistik', role: 'koordinator' },
  { nama: 'Moh. Nabil S.', nim: 'F55124079', email: 'nabil@hmti.untad.ac.id', divisi: 'lapangan', role: 'koordinator' },
  { nama: 'Ahmad Jayadi', nim: 'F52124002', email: 'jayadi@hmti.untad.ac.id', divisi: 'keamanan', role: 'koordinator' },
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

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of personel) {
    const divId = divMap[p.divisi];
    const roleId = roleMap[p.role];

    if (!divId) { console.error(`  ✗ Divisi "${p.divisi}" not found`); errors++; continue; }
    if (!roleId) { console.error(`  ✗ Role "${p.role}" not found`); errors++; continue; }

    let authUserId;

    // Try to create auth user (idempotent check via error handling)
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: p.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: p.nama, nim: p.nim },
    });

    if (createErr) {
      // User likely already exists — fetch by listing
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === p.email);
      if (existing) {
        authUserId = existing.id;
        console.log(`  ~ ${p.nama} — auth user exists`);
      } else {
        console.error(`  ✗ ${p.nama}: ${createErr.message}`);
        errors++;
        continue;
      }
    } else if (newUser?.user) {
      authUserId = newUser.user.id;
      console.log(`  ✓ Auth: ${p.nama} (${p.email} / ifest2026)`);
    } else {
      console.error(`  ✗ ${p.nama}: unknown error creating auth user`);
      errors++;
      continue;
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile manually (in case trigger didn't fire)
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: authUserId,
        full_name: p.nama,
        nim: p.nim,
      });

      if (profileErr) {
        console.error(`  ✗ Profile ${p.nama}: ${profileErr.message}`);
        errors++;
        continue;
      }
      console.log(`  ✓ Profile: ${p.nama}`);
    }

    // Check assignment
    const { data: existingAssignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('user_id', authUserId)
      .maybeSingle();

    if (existingAssignment) {
      console.log(`  ~ ${p.nama} — already assigned`);
      skipped++;
      continue;
    }

    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: YEAR_ID,
      user_id: authUserId,
      division_id: divId,
      role_id: roleId,
    });

    if (assignErr) {
      console.error(`  ✗ Assignment ${p.nama}: ${assignErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${p.nama} → ${p.divisi} as ${p.role}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} assigned, ${skipped} skipped, ${errors} errors`);
}

seed().catch(console.error);
