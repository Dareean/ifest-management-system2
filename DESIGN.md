# DESIGN.md — IFEST 2026 "Digital Symphony" Design System

> Diekstrak langsung dari source code `Dareean/ifest-2026-main-page` (Vue 3 + Vite + Tailwind CSS) dan referensi visual dashboard admin/peserta di `ifestuntad.my.id`. Semua nilai di bawah ini adalah nilai **asli**, bukan estimasi, diambil dari `tailwind.config.js` dan `src/style.css`.

---

## 1. Filosofi Desain

Nama proyek desain: **"Digital Symphony"** — perpaduan estetika **Risograph print** (misregistrasi warna, tekstur kertas, sketchy border) dengan **UI dashboard modern minimalis** (untuk area admin/peserta). Landing page publik memakai gaya riso yang lebih ekspresif; dashboard/admin panel memakai versi yang jauh lebih bersih, senyap, dan fungsional — tetap satu keluarga warna & tipografi, tapi dengan sedikit/tanpa efek riso agar tetap mudah dibaca sebagai alat kerja.

Dua "mode" dalam satu sistem:
- **Marketing / Landing (riso-heavy):** noise tekstur kertas, garis putus-putus (dashed), pergeseran plate warna (color misregistration), border organik.
- **Dashboard / Admin / Peserta (clean minimal):** flat card putih, radius besar, border tipis nyaris transparan, shadow sangat lembut, tipografi mono untuk label kecil.

---

## 2. Warna (Color Tokens)

Diambil persis dari `tailwind.config.js`. Warna paling sering dipakai di UI dashboard ditandai ⭐.

### Warna Inti / Netral
| Token | Hex | Kegunaan |
|---|---|---|
| `background` / `surface` / `surface-bright` | `#FDF8FA` ⭐ | Background utama seluruh app (off-white kemerahan hangat) |
| `on-background` / `on-surface` | `#1D1B1D` | Warna teks utama |
| `on-surface-variant` | `#4A454C` | Teks sekunder / label |
| `midnight` | `#04000D` ⭐ | Hitam-hampir-hitam. Dipakai untuk sidebar aktif state, tombol dark, badge admin, border tipis (`/5`, `/10` opacity) |
| `primary` | `#000000` | Hitam solid (tombol utama, teks judul besar) |
| `off-white` | `#F5F5F5` | Card alternatif / plate background riso |
| `outline` | `#7B757C` | Border/garis default |
| `outline-variant` | `#CCC4CC` | Border lebih halus |
| `surface-variant` | `#E6E1E3` | Background elemen non-aktif |
| `surface-container` | `#F2ECEF` | Card container alternatif |
| `surface-container-high` | `#ECE7E9` | Container level lebih terang |
| `secondary` | `#5D5F5F` | Teks abu netral |

### Warna Aksen (Signature)
| Token | Hex | Kegunaan |
|---|---|---|
| `accent-magenta` | `#FF3D8B` ⭐ | **Warna signature brand.** Dipakai untuk: label eyebrow ("ADMIN PANEL"), status "Ditolak"/rejected, ikon chart, link, garis bawah aktif |
| `lime-bright` | `#FDE047` | Aksen kuning-lime (highlight, plate warna riso) |
| `block-mint` | `#C8E6CD` | Blok warna dekoratif |
| `block-pink` | `#EFD4D4` | Blok warna dekoratif |
| `block-coral` | `#F3C9B6` | Blok warna dekoratif |
| `block-lime` | `#DCEEB1` ⭐ | Dipakai di icon badge "Admin Panel" (shield), badge status verified/hijau |
| `block-lilac` | `#C5B0F4` | Blok warna dekoratif |
| `tertiary-container` | `#151E12` | Container gelap hijau tua |

### Warna Status (non-token, dipakai inline via Tailwind default palette)
| Status | Warna | Kelas Tailwind contoh |
|---|---|---|
| Pending | Amber | `bg-[#FFF9E6]` bg, `text-amber-600` icon, `border-amber-200/50` |
| Terverifikasi | Hijau/Lime | `bg-[#DCEEB1]/30`, `text-green-700`, `border-[#DCEEB1]/50` |
| Ditolak | Magenta | `bg-[#FF3D8B]/10`, `text-accent-magenta`, `border-accent-magenta/20` |
| Chart donut: Terverifikasi | `#10B981` (emerald) |
| Chart donut: Pending | `#F59E0B` (amber) |
| Chart donut: Ditolak | `#FF3D8B` (magenta) |

**Catatan penting:** hampir semua border di dashboard menggunakan `border-[#04000D]/5` (hitam dengan opacity 5%) — inilah yang membuat card terlihat "nyaris tanpa border" tapi tetap terpisah dari background.

---

## 3. Tipografi

### Font Family (Google Fonts, di-import via `index.html`)
```html
family=Geist:wght@100..900
family=Inter:wght@100..900
family=Plus+Jakarta+Sans:wght@200..800
family=JetBrains+Mono:wght@100..800
```

| Peran | Font Stack |
|---|---|
| Body & Heading utama | `'Geist', 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` |
| Label kecil / eyebrow / caption / data mono | `'JetBrains Mono', monospace` |

### Skala Tipografi (dari `tailwind.config.js` fontSize)
| Token | Size | Line-height | Letter-spacing | Weight |
|---|---|---|---|---|
| `display-xl` | 86px | 1.0 | -0.02em | 600 |
| `display-lg` | 64px | 1.1 | -0.015em | 600 |
| `headline-lg` | 32px | 1.2 | -0.01em | 500 |
| `headline-lg-mobile` | 28px | 1.2 | -0.01em | 500 |
| `body-lg` | 20px | 1.4 | -0.01em | 400 |
| `body-md` | 18px | 1.45 | -0.01em | 400 |
| `button` | 18px | 1.0 | 0 | 500 |
| `eyebrow` | 14px | 1.0 | **0.05em** | 500 |
| `caption` | 12px | 1.0 | 0.05em | 400 |

### Pola nyata dari komponen Dashboard (contoh: halaman "Dashboard" admin)
```html
<span class="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta">
  Admin Panel
</span>
<h1 class="font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface">
  Dashboard
</h1>
```
→ Ini pola khas di setiap halaman: **eyebrow mono kecil magenta uppercase** di atas **judul besar extrabold hitam**.

Label kolom tabel dan stat card kecil: `font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50`.

---

## 4. Spacing & Layout

### Spacing Tokens
| Token | Value |
|---|---|
| `xs` | 8px |
| `sm` | 16px |
| `md` | 24px |
| `lg` | 32px |
| `xl` | 48px |
| `unit` | 8px (base unit) |
| `section-gap` | 96px |
| `container-max` | 1280px |

### Struktur Layout Dashboard (dari `DashboardAdminLayout.vue`)
- **Sidebar:** fixed/sticky kiri, lebar `w-72` (mobile) → `md:w-64` → `lg:w-72`, tinggi penuh (`h-screen`), background putih solid, `border-r border-[#04000D]/5`.
  - Header sidebar: 3 logo berjajar (UNTAD, HMTI, I-FEST) dipisah garis vertikal tipis `bg-slate-200`, padding `px-6 py-6`, border bawah `border-[#04000D]/5`.
  - Badge "Admin Panel": card gelap `bg-[#04000D]` rounded-xl, ikon shield di kotak `bg-[#DCEEB1]`, teks nama admin mono kecil `text-[#DCEEB1]/70`.
  - Nav item: `px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider`. **Aktif** → `bg-[#04000D] text-[#DCEEB1] shadow-sm` + ikon `ChevronRight` di kanan. **Non-aktif** → `text-on-surface-variant hover:bg-slate-50`.
  - Badge notifikasi (jumlah pending) → pill kecil `bg-amber-500` (atau `bg-accent-magenta` untuk unlock request) `text-white font-mono text-[9px] font-black rounded-full`.
  - Footer sidebar: tombol "Keluar" magenta, `text-accent-magenta hover:bg-accent-magenta/[0.03]`.
- **Main content:** `flex-1`, padding responsif `p-5 md:p-8 lg:p-10 xl:p-12`.
- **Mobile header:** muncul di bawah `md`, `bg-white border-b border-[#04000D]/5 shadow-sm`.

### Pola Card Standar (dipakai di seluruh dashboard)
```html
<div class="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5">
```
→ Ini resep card yang muncul berulang kali: **rounded-2xl, border hitam 5% opacity, shadow custom sangat halus (`0 8px 30px rgba(0,0,0,0.015)`), padding 5 atau 6.**

### Stat Card (icon + angka)
```html
<div class="w-12 h-12 rounded-xl bg-[warna]/opacity border border-[warna]/opacity flex items-center justify-center">
  <Icon class="w-6 h-6 text-[warna]" />
</div>
<p class="font-mono text-[9px] font-bold uppercase text-on-surface-variant/50 tracking-wider">Label</p>
<p class="font-extrabold text-2xl text-on-surface">{{ angka }}</p>
```

### Grid pattern
- Stat cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5`
- Chart section: `grid grid-cols-1 lg:grid-cols-3 gap-5` (chart utama `lg:col-span-2`)

---

## 5. Border Radius

| Token | Value |
|---|---|
| Default | 0.25rem (4px) |
| `lg` | 0.5rem (8px) |
| `xl` | 0.75rem (12px) |
| `full` | 9999px (pill) |
| Card dashboard | `rounded-2xl` (16px) — paling umum |
| Sidebar/nav item | `rounded-xl` (12px) |

Untuk elemen bergaya riso (landing page), radius organik non-simetris:
```css
border-radius: 32px 28px 34px 29px / 29px 34px 28px 32px; /* sketchy-lg */
border-radius: 24px 20px 26px 22px / 22px 26px 20px 24px; /* sketchy-md */
```

---

## 6. Shadow

Dashboard TIDAK memakai shadow Tailwind default — memakai custom shadow sangat tipis:
```css
shadow-[0_8px_30px_rgb(0,0,0,0.015)]
```
Ini kunci "look" flat-tapi-mengambang khas dashboard ini. Jangan pakai `shadow-md`/`shadow-lg` standar Tailwind — terlalu berat dibanding aslinya.

---

## 7. Efek Signature "Riso" (untuk landing page / elemen dekoratif)

Efek ini **tidak dipakai di dashboard admin/peserta**, tapi penting untuk landing page publik agar "100% mirip" brand keseluruhan:

1. **Paper texture noise** — overlay SVG turbulence opacity 0.05 di seluruh body.
2. **Riso grain/dot screen** pada background (`bg-background`, `bg-off-white`, dst) — radial-gradient dot 1px + noise SVG, opacity 0.04, hanya aktif di `md:` ke atas.
3. **Card/button "plate misregistration"** (`riso-card-plate`, `riso-btn-plate`, `riso-btn-dark`): elemen punya lapisan `::after` warna solid (default magenta `#FF3D8B` atau custom via `--plate-color`) yang digeser 1.5–3px saat normal, dan bergerak balik saat hover/active — efek cetak risograph yang "meleset sedikit".
4. **Text shadow misregistrasi warna** (`riso-text-shadow-magenta`, `-lime`, `-double`, dst) untuk judul besar.
5. **Sketchy dashed border** dengan radius organik asimetris (lihat bagian 5).
6. **Ticket-cut notch** — potongan lingkaran kiri-kanan seperti sobekan tiket.

---

## 8. Ikon

Menggunakan **lucide-vue-next** (Lucide icon set), ukuran umum `w-4 h-4` (nav), `w-5 h-5` (badge), `w-6 h-6` (stat card icon).

---

## 9. Contoh Referensi Halaman (dari screenshot)

| Halaman | Pola Utama |
|---|---|
| Admin Dashboard | Eyebrow + H1, 4 stat card grid, 2 chart card (bar horizontal per lomba + donut SVG status) |
| Pendaftaran (tabel) | Search bar + 4 dropdown filter + tombol "Export CSV" hitam, tabel dengan header uppercase mono abu, badge status pill |
| Kelola Timeline | Tabel manajemen dengan kolom warna aksen (dot bulat warna fase), badge status (`COMPLETED` hijau, `ONGOING` biru, `UPCOMING` abu) |
| Pengguna | Tabel + dropdown role inline + ikon aksi (mata/hapus) |
| Dashboard Peserta | Sapaan "Halo, {nama}!" + banner warning kuning "Profil Belum Lengkap" + progress bar hijau per lomba |
| Profil | Avatar kotak hitam berinisial, 2 kolom form (Data Diri kiri sempit, kanan detail lengkap) |

---

## 10. Ringkasan Cepat (Quick Reference untuk implementasi)

```js
// Warna paling sering dipakai
bg-background        // #FDF8FA — background utama
bg-white              // card
border-[#04000D]/5    // border card standar
text-on-surface        // #1D1B1D — teks utama
text-on-surface-variant // #4A454C — teks sekunder
text-accent-magenta    // #FF3D8B — aksen brand
bg-[#04000D]          // sidebar aktif / badge admin
text-[#DCEEB1]        // teks di atas background gelap (lime pucat)

// Card standar
"bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5"

// Eyebrow + Judul
"font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta"
"font-extrabold text-3xl md:text-4xl tracking-tight text-on-surface"

// Font
font-family: 'Geist', 'Inter', 'Plus Jakarta Sans', sans-serif;   // body/heading
font-family: 'JetBrains Mono', monospace;                          // label/mono
```

---

*Sumber: repo `Dareean/ifest-2026-main-page` (`tailwind.config.js`, `src/style.css`, `DashboardAdminLayout.vue`, `AdminDashboard.vue`) + verifikasi visual dari screenshot dashboard admin & peserta `ifestuntad.my.id`.*
