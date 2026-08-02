const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const DEFAULT_PASSWORD = 'ifest2026';

// People to UPDATE (existing auth users — find by NIM, change email)
const updates = [
  { nim: 'F55124086', newEmail: 'dmardin@gmail.com', name: 'Dareean A. Raffi Mardin' },
  { nim: 'F55124076', newEmail: 'gabrielsupari@gmail.com', name: 'Gabriel Kristofan' },
  { nim: 'F52124039', newEmail: 'akureyqal@gmail.com', name: 'Reyqal Syawalano' },
  { nim: 'F52124024', newEmail: 'nraainun06@gmail.com', name: 'Nur Ainun' },
  { nim: 'F52124004', newEmail: 'yulianingsih180705@gmail.com', name: 'Yulianingsih' },
  { nim: 'F52124015', newEmail: 'larafzia26@gmail.com', name: 'Lara Fauzia' },
  { nim: 'F52124034', newEmail: 'putriintana336@gmail.com', name: 'Putri Intan A.' },
  { nim: 'F52124044', newEmail: 'ansyahfebri713@gmail.com', name: 'Febriansyah .H' },
  { nim: 'F52124052', newEmail: 'fauzi@ifest.com', name: 'Moh. Fauzi R.' },
  { nim: 'F52124017', newEmail: 'melziielll@gmail.com', name: 'Nur Amelia' },
  { nim: 'F52124023', newEmail: 'gaidamuthmainnah10@gmail.com', name: 'Gaida Muthmainnah' },
  { nim: 'F55124044', newEmail: 'salsabilabilasalsa443@gmail.com', name: 'Salsabila' },
  { nim: 'F55124104', newEmail: 'moh.magribi13@gmail.com', name: 'Moh. Magribi R.' },
  { nim: 'F55124079', newEmail: 'nabilsmpit@gmail.com', name: 'Moh. Nabil S.' },
  { nim: 'F52124002', newEmail: 'hilman.ahmad983@gmail.com', name: 'Ahmad Jayadi' },
];

// New people to CREATE
const newMembers = [
  { nama: 'Ahdayani Dwi Putri', nim: 'F55124016', email: 'ahdayani92@gmail.com', divisi: 'acara', role: 'wakil-koordinator' },
  { nama: 'Moh Fiqri A.Hi.Djufri', nim: 'F5212530099', email: 'fikri.gh12@gmail.com', divisi: 'lapangan', role: 'koordinator' },
];

async function getDivisionsAndRoles() {
  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');
  if (!divisions || !roles) throw new Error('Failed to fetch divisions/roles');
  return {
    divMap: Object.fromEntries(divisions.map(d => [d.slug, d.id])),
    roleMap: Object.fromEntries(roles.map(r => [r.slug, r.id])),
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findUserByNim(nim) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('nim', nim)
    .maybeSingle();
  return profiles;
}

async function updateEmails() {
  console.log('\n=== UPDATING EXISTING AUTH USER EMAILS ===\n');
  let updated = 0;
  let errors = 0;

  for (const u of updates) {
    const profile = await findUserByNim(u.nim);
    if (!profile) {
      console.error(`  ✗ ${u.name} (${u.nim}) — profile not found`);
      errors++;
      continue;
    }

    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      email: u.newEmail,
    });

    if (error) {
      console.error(`  ✗ ${u.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${u.name} → ${u.newEmail}`);
      updated++;
    }
    await sleep(500);
  }

  console.log(`\nEmail updates: ${updated} done, ${errors} errors\n`);
}

async function createNewMembers({ divMap, roleMap }) {
  console.log('\n=== CREATING NEW CORE MEMBERS ===\n');
  let created = 0;
  let errors = 0;

  for (const p of newMembers) {
    const divId = divMap[p.divisi];
    const roleId = roleMap[p.role];

    if (!divId) { console.error(`  ✗ Divisi "${p.divisi}" not found`); errors++; continue; }
    if (!roleId) { console.error(`  ✗ Role "${p.role}" not found`); errors++; continue; }

    // Check if already exists by NIM
    const existing = await findUserByNim(p.nim);
    if (existing) {
      console.log(`  ~ ${p.nama} — already exists as ${existing.full_name}`);
      continue;
    }

    const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
      email: p.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: p.nama, nim: p.nim },
    });

    if (authErr) {
      console.error(`  ✗ ${p.nama} auth: ${authErr.message}`);
      errors++;
      continue;
    }

    const profileId = newUser.user.id;

    // Profile (trigger should handle, but upsert for safety)
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: profileId,
      full_name: p.nama,
      nim: p.nim,
    }).select('id').single();

    if (profileErr) {
      console.error(`  ✗ ${p.nama} profile: ${profileErr.message}`);
      errors++;
      continue;
    }

    // Assignment
    const { error: assignErr } = await supabase.from('committee_assignments').insert({
      committee_year_id: YEAR_ID,
      user_id: profileId,
      division_id: divId,
      role_id: roleId,
    });

    if (assignErr) {
      console.error(`  ✗ ${p.nama} assign: ${assignErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${p.nama} (${p.nim}) → ${p.divisi} as ${p.role} [${p.email}]`);
      created++;
    }
    await sleep(500);
  }

  console.log(`\nNew members: ${created} created, ${errors} errors\n`);
}

async function main() {
  console.log('=== CORE TEAM EMAIL UPDATE & SEED ===\n');

  const { divMap, roleMap } = await getDivisionsAndRoles();
  console.log(`Found ${Object.keys(divMap).length} divisions, ${Object.keys(roleMap).length} roles\n`);

  await updateEmails();
  await createNewMembers({ divMap, roleMap });

  console.log('\n=== DONE ===');
  console.log('Password for all accounts: ifest2026');
}

main().catch(console.error);
