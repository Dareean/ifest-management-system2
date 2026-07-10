const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxmxbyiggrottreetrig.supabase.co';
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bXhieWlnZ3JvdHRyZWV0cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzM5NjczNSwiZXhwIjoyMDk4OTcyNzM1fQ.XOqLhMsqoHAb3J6FZH6jo4jZiOAxGl6BMhdZshY_3xw';
const supabase = createClient(supabaseUrl, svcKey, { auth: { persistSession: false } });

const yearId = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

async function seed() {
  console.log('Note: Auth trigger must be set up manually via Supabase SQL Editor. See seed.sql for the trigger SQL.');

  // 2. Divisions
  const divisions = [
    { committee_year_id: yearId, name: 'BPH', slug: 'bph', description: 'Badan Pengurus Harian', sort_order: 0 },
    { committee_year_id: yearId, name: 'Acara', slug: 'acara', description: 'Divisi Acara', sort_order: 1 },
    { committee_year_id: yearId, name: 'Humas', slug: 'humas', description: 'Divisi Humas', sort_order: 2 },
    { committee_year_id: yearId, name: 'Sponsorship', slug: 'sponsorship', description: 'Divisi Sponsorship', sort_order: 3 },
    { committee_year_id: yearId, name: 'Kreativitas', slug: 'kreativitas', description: 'Divisi Kreativitas', sort_order: 4 },
    { committee_year_id: yearId, name: 'Ekonomi Kreatif', slug: 'ekonomi-kreatif', description: 'Divisi Ekonomi Kreatif', sort_order: 5 },
    { committee_year_id: yearId, name: 'Konsumsi', slug: 'konsumsi', description: 'Divisi Konsumsi', sort_order: 6 },
    { committee_year_id: yearId, name: 'Logistik', slug: 'logistik', description: 'Divisi Logistik', sort_order: 7 },
    { committee_year_id: yearId, name: 'Lapangan', slug: 'lapangan', description: 'Divisi Lapangan', sort_order: 8 },
    { committee_year_id: yearId, name: 'Keamanan', slug: 'keamanan', description: 'Divisi Keamanan', sort_order: 9 },
  ];

  console.log('Seeding divisions...');
  const { error: divErr } = await supabase.from('divisions').upsert(divisions, { onConflict: 'committee_year_id,slug' });
  if (divErr) throw divErr;
  console.log('Divisions OK');

  // 3. Roles
  const roles = [
    { committee_year_id: yearId, name: 'PIC / Penanggung Jawab', slug: 'pic', level: 100, is_approver: true, is_meeting_creator: true },
    { committee_year_id: yearId, name: 'Ketua Panitia', slug: 'ketua-panitia', level: 90, is_approver: true, is_meeting_creator: true },
    { committee_year_id: yearId, name: 'Wakil Ketua', slug: 'wakil-ketua', level: 80, is_approver: true, is_meeting_creator: true },
    { committee_year_id: yearId, name: 'Sekretaris I', slug: 'sekretaris-1', level: 75, is_approver: true, is_meeting_creator: false },
    { committee_year_id: yearId, name: 'Sekretaris II', slug: 'sekretaris-2', level: 75, is_approver: true, is_meeting_creator: false },
    { committee_year_id: yearId, name: 'Bendahara', slug: 'bendahara', level: 70, is_approver: false, is_meeting_creator: false },
    { committee_year_id: yearId, name: 'Koordinator Divisi', slug: 'koordinator', level: 60, is_approver: false, is_meeting_creator: true },
    { committee_year_id: yearId, name: 'Wakil Koordinator', slug: 'wakil-koordinator', level: 55, is_approver: false, is_meeting_creator: false },
    { committee_year_id: yearId, name: 'Anggota', slug: 'anggota', level: 50, is_approver: false, is_meeting_creator: false },
    { committee_year_id: yearId, name: 'PIC / Penanggung Jawab Subdivisi', slug: 'pic-sub', level: 53, is_approver: false, is_meeting_creator: false },
  ];

  console.log('Seeding roles...');
  const { error: roleErr } = await supabase.from('roles').upsert(roles, { onConflict: 'committee_year_id,slug' });
  if (roleErr) throw roleErr;
  console.log('Roles OK');

  // 4. KPI Items
  const kpis = [
    // BPH
    { committee_year_id: yearId, division_slug: 'bph', title: 'Audiensi Eksternal VVIP', target: 'Hadir 100% pada Audiensi Eksternal VVIP (Dekanat, BI, Hannah Asa, Sponsor Utama)', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'bph', title: 'Resolusi Bottleneck Antar-Divisi', target: 'Menyelesaikan 100% hambatan komunikasi antar-divisi', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'bph', title: 'Notulensi Rapat', target: 'Notulensi dirilis maksimal 2x24 jam menggunakan format poin-poin singkat', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'bph', title: 'Template Surat Baku HMTI', target: '100% surat/proposal menggunakan Template Baku HMTI', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'bph', title: 'LPJ Bulanan', target: 'Draft LPJ dicicil per bulan', is_milestone: false },
    // Acara
    { committee_year_id: yearId, division_slug: 'acara', title: 'Konsep Kasar & Rulebook', target: 'Menyelesaikan 100% penyusunan konsep kasar, Rulebook Lomba, draft Rundown', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Modul Edukasi Roadshow', target: 'Fiksasi 1 Modul Edukasi Baku bersama Hannah Asa', deadline: '2026-05-31', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Tim Kecil Roadshow', target: 'Membentuk 3 Tim Kecil Roadshow dari anggota panitia lain untuk 25 titik', deadline: '2026-08-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Draft Rulebook 5 Lomba', target: 'Menyelesaikan Draft Rulebook untuk 5 lomba (RAB Kasar & Aturan Lomba)', deadline: '2026-05-31', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Buku Saku Modul Visitasi', target: 'Merumuskan draft Buku Saku Modul Visitasi sebagai syarat konversi SKS', deadline: '2026-08-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Audiensi Mitra Travel', target: 'Audiensi fiksasi dengan minimal 1 Mitra Travel Tour pada bulan Juni', deadline: '2026-06-30', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Blueprint Expo', target: 'Fiksasi Blueprint pembagian lapak/zonasi Paviliun S-DIH', deadline: '2026-08-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'acara', title: 'Kurasi 5 Karya Inovasi', target: 'Mengkurasi minimal 5 karya Inovasi dari mahasiswa tingkat akhir JTI', deadline: '2026-11-01', is_milestone: false },
    // Humas
    { committee_year_id: yearId, division_slug: 'humas', title: 'Response Time Medsos', target: 'Merespons interaksi via DM Instagram/Tiktok/WA maksimal 1x24 jam', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'humas', title: 'Eksekusi Surat Lintas Divisi', target: '100% permohonan draft surat dari divisi lain dieksekusi tanpa delay', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'humas', title: 'MoU Media Partner', target: 'Mengamankan MoU dengan minimal 15 Media Partner Lokal + 5 Nasional', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'humas', title: 'Distribusi Surat', target: 'Tingkat keberhasilan distribusi surat/proposal mencapai 95%', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'humas', title: 'Survei Venue', target: 'Laporan survei venue diperbarui maksimal 1x24 jam setelah dari lapangan', is_milestone: false },
    // Sponsorship
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'Closing Deal Sponsor', target: 'Wajib hadir mendampingi Ketupat/PIC dalam Negosiasi Final sponsor Diamond & Tungsten', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'Database Leads', target: 'Menyetorkan minimal 30 leads valid (Nama Manajer, Email HR/PR, No. Kontak)', deadline: '2026-06-30', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'Proposal Kustom', target: '100% proposal VIP/BUMN/Instansi telah di-kustomisasi (logo perusahaan + nama direktur)', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'Distribusi Proposal Fisik', target: '100% proposal fisik terdistribusi dengan follow-up H+3 dan H+7', deadline: '2026-08-01', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'QC Visual Sponsor', target: '0% komplain sponsor terkait peletakan logo, ad-libs MC, booth', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'sponsorship', title: 'LPJ & Plakat Sponsor', target: 'Menyerahkan LPJ dan Plakat Apresiasi ke mitra maksimal H+14', deadline: '2026-11-14', is_milestone: true },
    // Kreativitas
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Konsistensi Brand', target: '100% output desain selaras dengan Brand Guidelines (KV) dari Buta Warna', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Zero Bottleneck Buta Warna', target: 'Tidak ada keterlambatan revisi komunikasi dengan tim Buta Warna', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Content Calendar Bulanan', target: 'Merilis Content Calendar selambatnya H-7 sebelum bulan baru', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Final Video H-2', target: 'Video promo/edukasi diserahkan maksimal H-2 dari jadwal tayang', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Desain Turunan 100%', target: '100% pemenuhan desain turunan tanpa mengubah Key Visual utama', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Cetak Biru Dekorasi', target: 'Mengesahkan Cetak Biru Dekorasi Venue dan RAB Estetika', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'kreativitas', title: 'Backup Dokumentasi', target: '100% file mentah dokumentasi tercadang maksimal 1x24 jam', is_milestone: false },
    // Ekonomi Kreatif
    { committee_year_id: yearId, division_slug: 'ekonomi-kreatif', title: 'Target Dana Usaha', target: 'Memenuhi 100% target Dana Usaha (Rp 28-31 Juta)', deadline: '2026-10-14', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'ekonomi-kreatif', title: 'Zero Loss Keuangan', target: '0% selisih antara jumlah kupon/barang terjual dengan kas', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'ekonomi-kreatif', title: 'Target Penjualan Rutin', target: '200-320 pcs dessert/minggu & 25-40 paket lunch/minggu', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'ekonomi-kreatif', title: 'Produksi Merchandise', target: 'Menyelesaikan produksi Merchandise Chapter 1 & 2 secara Pre-Order tanpa overstok', deadline: '2026-08-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'ekonomi-kreatif', title: 'DP Tenant UMKM', target: 'Mengamankan DP 50% dari 15-30 Tenant UMKM', deadline: '2026-10-01', is_milestone: false },
    // Konsumsi
    { committee_year_id: yearId, division_slug: 'konsumsi', title: 'Fiksasi Vendor Catering', target: 'Mengesahkan RAB detail Konsumsi dan fiksasi 100% vendor', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'konsumsi', title: 'Riders VIP', target: 'Menyediakan riders konsumsi artis/VIP 100% sesuai permintaan', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'konsumsi', title: 'Distribusi Ransum', target: '0% panitia/relawan yang tidak mendapat jatah makan', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'konsumsi', title: 'Loading Konsumsi', target: 'Loading ribuan boks makanan dari vendor ke ruang penyimpanan < 30 menit', is_milestone: false },
    // Logistik
    { committee_year_id: yearId, division_slug: 'logistik', title: 'Kesiapan Properti Roadshow', target: '100% properti Roadshow sedia H-1 sebelum keberangkatan', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'logistik', title: 'Pengembalian Barang Pinjaman', target: '100% barang pinjaman HMTI/Fakultas kembali H+3 tanpa hilang/rusak', deadline: '2026-11-13', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'logistik', title: 'Verifikasi Anggaran Barang', target: '100% RAB Barang terverifikasi urgensinya', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'logistik', title: 'Pengecekan Alat H-2', target: 'Memastikan fungsi alat (HT, kabel) pada H-2 sebelum diserahkan', is_milestone: false },
    // Lapangan
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Area Venue Siap H-1', target: 'Area venue 100% siap operasional maksimal H-1', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Cetak Biru Keamanan Ring 1', target: 'Mengesahkan Cetak Biru lapis keamanan fisik Ring 1', deadline: '2026-10-14', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Navigasi VIP', target: '100% tamu VVIP tiba di kursi/ruang transit tanpa tersesat', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Delay Taktis Maksimal 3 Menit', target: 'Delay maksimal 3 menit sejak perintah dikeluarkan oleh Koor Lapangan', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'lapangan', title: '0% Penumpukan Massa', target: '0% bottleneck fatal di area registrasi dan lorong Expo', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Backup Genset', target: '0% insiden listrik anjlok dengan menyiapkan backup genset', deadline: '2026-10-28', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'lapangan', title: 'Changeover Panggung', target: '0% kendala posisi kursi/meja saat narasumber di atas panggung', is_milestone: false },
    // Keamanan
    { committee_year_id: yearId, division_slug: 'keamanan', title: 'Personel Keamanan Eksternal', target: 'Mengamankan minimal 20 personel keamanan eksternal (Menwa/Polisi)', deadline: '2026-10-01', is_milestone: true },
    { committee_year_id: yearId, division_slug: 'keamanan', title: 'Sterilisasi Backstage', target: 'Mencegah penyusup tanpa ID Card/Gelang Akses khusus', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'keamanan', title: '0% Kebocoran Tiket', target: '0% penonton tanpa tiket masuk', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'keamanan', title: 'Keamanan Roadshow', target: '0 insiden keselamatan saat 25 titik Roadshow', is_milestone: false },
    { committee_year_id: yearId, division_slug: 'keamanan', title: 'Posko P3K', target: 'Menyiapkan posko P3K dan jalur darurat', is_milestone: false },
  ];

  // Fetch division IDs
  const { data: divData } = await supabase.from('divisions').select('id,slug');
  const divMap = {};
  divData.forEach(d => { divMap[d.slug] = d.id; });

  const kpiWithIds = kpis.map(k => ({
    committee_year_id: yearId,
    division_id: divMap[k.division_slug],
    title: k.title,
    target: k.target,
    deadline: k.deadline || null,
    is_milestone: k.is_milestone,
  }));

  console.log('Clearing old KPIs for this year...');
  await supabase.from('kpi_items').delete().eq('committee_year_id', yearId);

  console.log('Seeding KPI items...');
  const { error: kpiErr } = await supabase.from('kpi_items').insert(kpiWithIds);
  if (kpiErr) throw kpiErr;
  console.log('KPIs OK');

  console.log('\nSeed complete!');
}

seed().catch(e => { console.error(e); process.exit(1); });
