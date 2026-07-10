const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
const DEFAULT_PASSWORD = 'ifest2026';

const personel = [
  // ============ ACARA ============
  { nama: 'Ahdayani Dwi Putri', nim: 'F55124016', email: 'ahdayani@ifest.com', divisi: 'acara', role: 'wakil-koordinator' },
  { nama: 'Ellen Tri Alfiana Salua', nim: 'F52124049', email: 'ellen.tri@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Jumiati Saripuding', nim: 'F5512530120', email: 'jumiati@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Retno Resya Dharma Putri Mambuhu', nim: 'F5512520038', email: 'retno.resya@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Saiful', nim: 'F5212510026', email: 'saiful@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Dinda Aulia Rizkiyanti Putri', nim: 'F5212530105', email: 'dinda.aulia@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'M. Setiyawan', nim: 'F5212520060', email: 'setiyawan@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Putri Alma Rizki', nim: 'F5512520077', email: 'putri.alma@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Cindy Novita Auliyah', nim: 'F5512510021', email: 'cindy.novita@ifest.com', divisi: 'acara', role: 'anggota' },
  { nama: 'Salwa Shafa Salsabila', nim: 'F5212510003', email: 'salwa.shafa@ifest.com', divisi: 'acara', role: 'anggota' },

  // ============ HUMAS ============
  { nama: 'Moh. Syahril A. Kadili', nim: 'F52124048', email: 'syahril.kadili@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Moh. Ikhsan', nim: 'F52124013', email: 'ikhsan@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Istianur Khalija', nim: 'F52124012', email: 'istianur@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Alifias', nim: 'F5512520099', email: 'alifias@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Adelia Mutmaina', nim: 'F5212510012', email: 'adelia.mutmaina@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Kissya Syahluna Rahim', nim: 'F5212520074', email: 'kissya@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Cut Safira', nim: 'F5512510022', email: 'cut.safira@ifest.com', divisi: 'humas', role: 'anggota' },
  { nama: 'Naila Afifah', nim: 'F5212520034', email: 'naila.afifah@ifest.com', divisi: 'humas', role: 'anggota' },

  // ============ SPONSORSHIP ============
  { nama: 'Niluh Elsa Cantika', nim: 'F52124031', email: 'niluh.elsa@ifest.com', divisi: 'sponsorship', role: 'anggota' },
  { nama: 'Marchella Silviana', nim: 'F52124021', email: 'marchella@ifest.com', divisi: 'sponsorship', role: 'anggota' },
  { nama: 'Nanda Chairunnisa', nim: 'F5512520041', email: 'nanda.chairunnisa@ifest.com', divisi: 'sponsorship', role: 'anggota' },
  { nama: 'Fathur Rahman', nim: 'F5212510011', email: 'fathur.rahman@ifest.com', divisi: 'sponsorship', role: 'anggota' },
  { nama: 'Muh Panji Raditya', nim: 'F5212520049', email: 'panji.raditya@ifest.com', divisi: 'sponsorship', role: 'anggota' },

  // ============ KREATIVITAS ============
  { nama: 'Vanissa Azzahra Nggiu', nim: 'F52124036', email: 'vanissa@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Zahra', nim: 'F52124035', email: 'zahra@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Aulia Ramadhani Asri', nim: 'F52124082', email: 'aulia.ramadhani@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Gloria Tanelova', nim: 'F52124030', email: 'gloria@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Samuel Hizkia Kuandu', nim: 'F52124005', email: 'samuel.kuandu@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Cristian Marsel Kasio', nim: 'F55124066', email: 'cristian@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Flesh Exel Saputra Tangkidi', nim: 'F5212510021', email: 'flesh.exel@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Teodorus Dwi Putra Sarungu', nim: 'F5512510029', email: 'teodorus@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Ardhita Amarli Putri', nim: 'F5212530109', email: 'ardhita@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Juan Terrin K. Samatimbang', nim: 'F5512520051', email: 'juan.terrin@ifest.com', divisi: 'kreativitas', role: 'anggota' },
  { nama: 'Rifka Anggraini', nim: 'F5212530115', email: 'rifka.anggraini@ifest.com', divisi: 'kreativitas', role: 'anggota' },

  // ============ EKONOMI KREATIF ============
  { nama: 'Muhammad Naufal Amar', nim: 'F55124090', email: 'naufal.amar@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Alya Nadira', nim: 'F52124011', email: 'alya.nadira@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Putri Ramadhani Maruf', nim: 'F52124018', email: 'putri.ramadhani@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Moh. Pasya Cakra Wangsa', nim: 'F55124103', email: 'pasya.cakra@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Nazwa Alifiah Bustaman', nim: 'F5512520050', email: 'nazwa.alifiah@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Nurul Asma', nim: 'F5512520078', email: 'nurul.asma@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Putri Arti Dinanti', nim: 'F5512520048', email: 'putri.arti@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Risqillah Dwi Rinanty', nim: 'F5512520056', email: 'risqillah@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },
  { nama: 'Wiko Brenton Askelon Mangoli', nim: 'F5212530098', email: 'wiko.brenton@ifest.com', divisi: 'ekonomi-kreatif', role: 'anggota' },

  // ============ KONSUMSI ============
  { nama: 'Latifah Putri', nim: 'F55124067', email: 'latifah.putri@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Elsya Armelya', nim: 'F52124006', email: 'elsya@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Ratu Annisa', nim: 'F52124022', email: 'ratu.annisa@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Moh Akbar Nusantara', nim: 'F5512520037', email: 'akbar.nusantara@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Nadya Syahara Salihin', nim: 'F5512510002', email: 'nadya.syahara@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Bayu Jaladara Anantakuva', nim: 'F5512520097', email: 'bayu.jaladara@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Adhysti Putri', nim: 'F5512510017', email: 'adhysti.putri@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Kasih Nurlianita', nim: 'F5512510032', email: 'kasih.nurlianita@ifest.com', divisi: 'konsumsi', role: 'anggota' },
  { nama: 'Zaskia Dian Amanda', nim: 'F5512510031', email: 'zaskia.dian@ifest.com', divisi: 'konsumsi', role: 'anggota' },

  // ============ LOGISTIK ============
  { nama: 'Moh. Fiqhi', nim: 'F55124108', email: 'fiqhi@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Moh. Reza Dwi Syahputra', nim: 'F55124085', email: 'reza.dwi@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Wiliam Steve Imanuel Chandra', nim: 'F55124111', email: 'wiliam.steve@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Andi Besse Opu Tenri Sompa', nim: 'F55124094', email: 'andi.besse@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Dini Zahra', nim: 'F55124113', email: 'dini.zahra@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Muhammad Raid Dzaky', nim: 'F5512520042', email: 'raid.dzaky@ifest.com', divisi: 'logistik', role: 'anggota' },
  { nama: 'Muhammad Zakiyullah', nim: 'F5512530107', email: 'zakiyullah@ifest.com', divisi: 'logistik', role: 'anggota' },

  // ============ LAPANGAN ============
  { nama: 'Raihan S. Atuka', nim: 'F55124026', email: 'raihan.atuka@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Saadah Ramadhan', nim: 'F52124087', email: 'saadah.ramadhan@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Moh Fiqri A.Hi.Djufri', nim: 'F5212530099', email: 'fiqri.djufri@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Muhammad Fadhlur Rahman', nim: 'F5212520046', email: 'fadhlur.rahman@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Ikhtiar M', nim: 'F5512520044', email: 'ikhtiar@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Nofragithos Marciano Maugo', nim: 'F5512520064', email: 'nofragithos@ifest.com', divisi: 'lapangan', role: 'anggota' },
  { nama: 'Muh. Afif Hamka', nim: 'F5512520058', email: 'afif.hamka@ifest.com', divisi: 'lapangan', role: 'anggota' },

  // ============ KEAMANAN ============
  { nama: 'Filtatra', nim: 'F52124072', email: 'filtatra@ifest.com', divisi: 'keamanan', role: 'anggota' },
  { nama: 'Rayhan Aliffinsi', nim: 'F52124010', email: 'rayhan.aliffinsi@ifest.com', divisi: 'keamanan', role: 'anggota' },
  { nama: 'Moh. Andhika Dinata', nim: 'F52124064', email: 'andhika.dinata@ifest.com', divisi: 'keamanan', role: 'anggota' },
  { nama: 'Iman Nugraha', nim: 'F5512520079', email: 'iman.nugraha@ifest.com', divisi: 'keamanan', role: 'anggota' },
  { nama: 'Andi Mafaatihur Qadri', nim: 'F5212530095', email: 'mafaatihur@ifest.com', divisi: 'keamanan', role: 'anggota' },
];

async function seed() {
  console.log(`Fetching divisions and roles for ${personel.length} anggota...`);
  const { data: divisions } = await supabase.from('divisions').select('id,slug');
  const { data: roles } = await supabase.from('roles').select('id,slug');

  if (!divisions || !roles) {
    console.error('Failed to fetch divisions/roles');
    return;
  }

  const divMap = Object.fromEntries(divisions.map(d => [d.slug, d.id]));
  const roleMap = Object.fromEntries(roles.map(r => [r.slug, r.id]));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of personel) {
    const divId = divMap[p.divisi];
    const roleId = roleMap[p.role];

    if (!divId) { console.error(`  ✗ Divisi "${p.divisi}" not found`); errors++; continue; }
    if (!roleId) { console.error(`  ✗ Role "${p.role}" not found`); errors++; continue; }

    // Create auth user
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: p.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: p.nama, nim: p.nim },
    });

    let authUserId;

    if (createErr) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === p.email);
      if (existing) {
        authUserId = existing.id;
      } else {
        console.error(`  ✗ ${p.nama}: ${createErr.message}`);
        errors++;
        continue;
      }
    } else if (newUser?.user) {
      authUserId = newUser.user.id;
    } else {
      console.error(`  ✗ ${p.nama}: unknown error`);
      errors++;
      continue;
    }

    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    if (!existingProfile) {
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
    }

    // Check existing assignment
    const { data: existingAssignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('user_id', authUserId)
      .maybeSingle();

    if (existingAssignment) {
      console.log(`  ~ ${p.nama} (${p.nim}) — already assigned`);
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
      console.error(`  ✗ ${p.nama}: ${assignErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${p.nama} (${p.nim}) → ${p.divisi} as ${p.role}`);
      created++;
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${errors} errors`);
}

seed().catch(console.error);
