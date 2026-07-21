const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

const picRoles = [
  // Acara
  { name: 'PIC Modul Edukasi Roadshow', slug: 'pic-modul-edukasi-roadshow' },
  { name: 'PIC Tim Kecil Roadshow', slug: 'pic-tim-kecil-roadshow' },
  { name: 'PIC Draft Rulebook 5 Lomba', slug: 'pic-draft-rulebook-5-lomba' },
  { name: 'PIC Buku Saku Modul Visitasi', slug: 'pic-buku-saku-modul-visitasi' },
  { name: 'PIC Audiensi Mitra Travel', slug: 'pic-audiensi-mitra-travel' },
  { name: 'PIC Blueprint Expo', slug: 'pic-blueprint-expo' },
  { name: 'PIC Kurasi 5 Karya Inovasi', slug: 'pic-kurasi-5-karya-inovasi' },

  // Humas
  { name: 'PIC Response Time Medsos', slug: 'pic-response-time-medsos' },
  { name: 'PIC Eksekusi Surat Lintas Divisi', slug: 'pic-eksekusi-surat-lintas-divisi' },
  { name: 'PIC MoU Media Partner', slug: 'pic-mou-media-partner' },
  { name: 'PIC Distribusi Surat', slug: 'pic-distribusi-surat' },
  { name: 'PIC Survei Venue', slug: 'pic-survei-venue' },

  // Sponsorship
  { name: 'PIC Closing Deal Sponsor', slug: 'pic-closing-deal-sponsor' },
  { name: 'PIC Database Leads', slug: 'pic-database-leads' },
  { name: 'PIC Proposal Kustom', slug: 'pic-proposal-kustom' },
  { name: 'PIC Distribusi Proposal Fisik', slug: 'pic-distribusi-proposal-fisik' },
  { name: 'PIC QC Visual Sponsor', slug: 'pic-qc-visual-sponsor' },
  { name: 'PIC LPJ & Plakat Sponsor', slug: 'pic-lpj-plakat-sponsor' },

  // Kreativitas
  { name: 'PIC Konsistensi Brand', slug: 'pic-konsistensi-brand' },
  { name: 'PIC Zero Bottleneck Buta Warna', slug: 'pic-zero-bottleneck-buta-warna' },
  { name: 'PIC Content Calendar Bulanan', slug: 'pic-content-calendar-bulanan' },
  { name: 'PIC Final Video H-2', slug: 'pic-final-video-h-2' },
  { name: 'PIC Desain Turunan 100%', slug: 'pic-desain-turunan-100' },
  { name: 'PIC Cetak Biru Dekorasi', slug: 'pic-cetak-biru-dekorasi' },
  { name: 'PIC Backup Dokumentasi', slug: 'pic-backup-dokumentasi' },

  // Ekonomi Kreatif
  { name: 'PIC Target Dana Usaha', slug: 'pic-target-dana-usaha' },
  { name: 'PIC Zero Loss Keuangan', slug: 'pic-zero-loss-keuangan' },
  { name: 'PIC Target Penjualan Rutin', slug: 'pic-target-penjualan-rutin' },
  { name: 'PIC Produksi Merchandise', slug: 'pic-produksi-merchandise' },
  { name: 'PIC DP Tenant UMKM', slug: 'pic-dp-tenant-umkm' },

  // Konsumsi
  { name: 'PIC Fiksasi Vendor Catering', slug: 'pic-fiksasi-vendor-catering' },
  { name: 'PIC Riders VIP', slug: 'pic-riders-vip' },
  { name: 'PIC Distribusi Ransum', slug: 'pic-distribusi-ransum' },
  { name: 'PIC Loading Konsumsi', slug: 'pic-loading-konsumsi' },

  // Logistik
  { name: 'PIC Kesiapan Properti Roadshow', slug: 'pic-kesiapan-properti-roadshow' },
  { name: 'PIC Pengembalian Barang Pinjaman', slug: 'pic-pengembalian-barang-pinjaman' },
  { name: 'PIC Verifikasi Anggaran Barang', slug: 'pic-verifikasi-anggaran-barang' },
  { name: 'PIC Pengecekan Alat H-2', slug: 'pic-pengecekan-alat-h-2' },

  // Lapangan
  { name: 'PIC Area Venue Siap H-1', slug: 'pic-area-venue-siap-h-1' },
  { name: 'PIC Cetak Biru Keamanan Ring 1', slug: 'pic-cetak-biru-keamanan-ring-1' },
  { name: 'PIC Navigasi VIP', slug: 'pic-navigasi-vip' },
  { name: 'PIC Delay Taktis Maksimal 3 Menit', slug: 'pic-delay-taktis-maksimal-3-menit' },
  { name: 'PIC 0% Penumpukan Massa', slug: 'pic-0-penumpukan-massa' },
  { name: 'PIC Backup Genset', slug: 'pic-backup-genset' },
  { name: 'PIC Changeover Panggung', slug: 'pic-changeover-panggung' },

  // Keamanan
  { name: 'PIC Personel Keamanan Eksternal', slug: 'pic-personel-keamanan-eksternal' },
  { name: 'PIC Sterilisasi Backstage', slug: 'pic-sterilisasi-backstage' },
  { name: 'PIC 0% Kebocoran Tiket', slug: 'pic-0-kebocoran-tiket' },
  { name: 'PIC Keamanan Roadshow', slug: 'pic-keamanan-roadshow' },
  { name: 'PIC Posko P3K', slug: 'pic-posko-p3k' }
];

async function insertRoles() {
  const rows = picRoles.map(r => ({
    committee_year_id: YEAR_ID,
    name: r.name,
    slug: r.slug,
    level: 53,
    is_approver: false,
    is_meeting_creator: false
  }));

  console.log(`Inserting ${rows.length} roles...`);
  const { data, error } = await supabase
    .from('roles')
    .insert(rows)
    .select();

  if (error) {
    console.error("Error inserting roles:", error);
  } else {
    console.log("Successfully inserted roles:", data.length);
  }
}

insertRoles();
