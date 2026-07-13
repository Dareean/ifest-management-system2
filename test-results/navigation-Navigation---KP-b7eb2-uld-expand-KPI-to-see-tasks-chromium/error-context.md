# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - KPI Routes >> should expand KPI to see tasks
- Location: tests\e2e\navigation.spec.ts:153:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('[data-testid="kpi-item"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - img "Logo UNTAD" [ref=e7]
          - img "Logo HMTI" [ref=e8]
          - img "Logo IFEST" [ref=e9]
        - generic [ref=e10]:
          - generic [ref=e11]: MT
          - generic [ref=e12]:
            - paragraph [ref=e13]: Member Test
            - paragraph [ref=e14]: member@test.ifest.local
        - navigation [ref=e15]:
          - link "OVERVIEW" [ref=e16] [cursor=pointer]:
            - /url: /dashboard
            - generic [ref=e17]:
              - img [ref=e18]
              - generic [ref=e23]: OVERVIEW
          - link "KPI" [ref=e24] [cursor=pointer]:
            - /url: /dashboard/kpi
            - generic [ref=e25]:
              - img [ref=e26]
              - generic [ref=e30]: KPI
            - img [ref=e31]
          - link "RAPAT" [ref=e33] [cursor=pointer]:
            - /url: /dashboard/meetings
            - generic [ref=e34]:
              - img [ref=e35]
              - generic [ref=e37]: RAPAT
          - link "PROFIL" [ref=e38] [cursor=pointer]:
            - /url: /dashboard/profile
            - generic [ref=e39]:
              - img [ref=e40]
              - generic [ref=e43]: PROFIL
      - generic [ref=e44]:
        - link "BERANDA" [ref=e45] [cursor=pointer]:
          - /url: /
          - img [ref=e46]
          - generic [ref=e49]: BERANDA
        - button "KELUAR" [ref=e50] [cursor=pointer]:
          - img [ref=e51]
          - generic [ref=e54]: KELUAR
    - generic [ref=e55]:
      - banner [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]: Senin, 13 Juli 2026
          - generic [ref=e59]: •
          - generic [ref=e60]: 13.41.05
        - button [ref=e62]:
          - img [ref=e63]
      - main [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - paragraph [ref=e70]: I-FEST 2026
              - heading "KPI Tracker" [level=1] [ref=e71]
              - paragraph [ref=e72]: Pantau pencapaian KPI dan task setiap divisi.
            - button "Export CSV" [ref=e74]:
              - img [ref=e75]
              - text: Export CSV
          - generic [ref=e79]:
            - generic [ref=e80]:
              - paragraph [ref=e81]: TOTAL KPI
              - paragraph [ref=e82]: "56"
              - paragraph [ref=e83]: Ditetapkan
            - generic [ref=e84]:
              - paragraph [ref=e85]: TOTAL TASKS
              - paragraph [ref=e86]: "0"
              - paragraph [ref=e87]: Task dikelola
            - generic [ref=e88]:
              - paragraph [ref=e89]: TASK SELESAI
              - paragraph [ref=e90]: 0 / 0
              - paragraph [ref=e91]: Tugas terselesaikan
          - generic [ref=e92]:
            - button "Semua Divisi" [ref=e93] [cursor=pointer]
            - button "BPH" [ref=e94] [cursor=pointer]
            - button "Acara" [ref=e95] [cursor=pointer]
            - button "Humas" [ref=e96] [cursor=pointer]
            - button "Sponsorship" [ref=e97] [cursor=pointer]
            - button "Kreativitas" [ref=e98] [cursor=pointer]
            - button "Ekonomi Kreatif" [ref=e99] [cursor=pointer]
            - button "Konsumsi" [ref=e100] [cursor=pointer]
            - button "Logistik" [ref=e101] [cursor=pointer]
            - button "Lapangan" [ref=e102] [cursor=pointer]
            - button "Keamanan" [ref=e103] [cursor=pointer]
          - generic [ref=e104]:
            - generic [ref=e105]:
              - img [ref=e106]
              - heading "Ringkasan Semua Divisi" [level=2] [ref=e109]
            - generic [ref=e110]:
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - heading "BPH" [level=3] [ref=e114]
                  - generic [ref=e115]: 5 KPI
                - paragraph [ref=e116]: 2 milestone · 0/0 tasks
              - generic [ref=e120]:
                - generic [ref=e121]:
                  - heading "Acara" [level=3] [ref=e122]
                  - generic [ref=e123]: 8 KPI
                - paragraph [ref=e124]: 6 milestone · 0/0 tasks
              - generic [ref=e128]:
                - generic [ref=e129]:
                  - heading "Humas" [level=3] [ref=e130]
                  - generic [ref=e131]: 5 KPI
                - paragraph [ref=e132]: 1 milestone · 0/0 tasks
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - heading "Sponsorship" [level=3] [ref=e138]
                  - generic [ref=e139]: 6 KPI
                - paragraph [ref=e140]: 3 milestone · 0/0 tasks
              - generic [ref=e144]:
                - generic [ref=e145]:
                  - heading "Kreativitas" [level=3] [ref=e146]
                  - generic [ref=e147]: 7 KPI
                - paragraph [ref=e148]: 2 milestone · 0/0 tasks
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - heading "Ekonomi Kreatif" [level=3] [ref=e154]
                  - generic [ref=e155]: 5 KPI
                - paragraph [ref=e156]: 2 milestone · 0/0 tasks
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - heading "Konsumsi" [level=3] [ref=e162]
                  - generic [ref=e163]: 4 KPI
                - paragraph [ref=e164]: 1 milestone · 0/0 tasks
              - generic [ref=e168]:
                - generic [ref=e169]:
                  - heading "Logistik" [level=3] [ref=e170]
                  - generic [ref=e171]: 4 KPI
                - paragraph [ref=e172]: 1 milestone · 0/0 tasks
              - generic [ref=e176]:
                - generic [ref=e177]:
                  - heading "Lapangan" [level=3] [ref=e178]
                  - generic [ref=e179]: 7 KPI
                - paragraph [ref=e180]: 3 milestone · 0/0 tasks
              - generic [ref=e184]:
                - generic [ref=e185]:
                  - heading "Keamanan" [level=3] [ref=e186]
                  - generic [ref=e187]: 5 KPI
                - paragraph [ref=e188]: 1 milestone · 0/0 tasks
          - generic [ref=e191]:
            - generic [ref=e192]:
              - img [ref=e193]
              - heading "Semua — KPI & Task" [level=2] [ref=e197]
            - generic [ref=e198]:
              - generic [ref=e199]:
                - generic [ref=e201]:
                  - generic [ref=e202]:
                    - generic [ref=e203]:
                      - heading "Audiensi Eksternal VVIP" [level=3] [ref=e204]
                      - generic [ref=e205]: Milestone
                    - paragraph [ref=e206]: Hadir 100% pada Audiensi Eksternal VVIP (Dekanat, BI, Hannah Asa, Sponsor Utama)
                  - generic [ref=e207]: 0/0 Tasks
                - generic [ref=e209]:
                  - generic [ref=e210]: Progress KPI
                  - generic [ref=e211]: 0%
                - generic [ref=e213]:
                  - paragraph [ref=e214]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e215] [cursor=pointer]:
                    - img [ref=e216]
                    - text: Tambah Task
              - generic [ref=e217]:
                - generic [ref=e219]:
                  - generic [ref=e220]:
                    - heading "Resolusi Bottleneck Antar-Divisi" [level=3] [ref=e222]
                    - paragraph [ref=e223]: Menyelesaikan 100% hambatan komunikasi antar-divisi
                  - generic [ref=e224]: 0/0 Tasks
                - generic [ref=e226]:
                  - generic [ref=e227]: Progress KPI
                  - generic [ref=e228]: 0%
                - generic [ref=e230]:
                  - paragraph [ref=e231]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e232] [cursor=pointer]:
                    - img [ref=e233]
                    - text: Tambah Task
              - generic [ref=e234]:
                - generic [ref=e236]:
                  - generic [ref=e237]:
                    - heading "Notulensi Rapat" [level=3] [ref=e239]
                    - paragraph [ref=e240]: Notulensi dirilis maksimal 2x24 jam menggunakan format poin-poin singkat
                  - generic [ref=e241]: 0/0 Tasks
                - generic [ref=e243]:
                  - generic [ref=e244]: Progress KPI
                  - generic [ref=e245]: 0%
                - generic [ref=e247]:
                  - paragraph [ref=e248]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e249] [cursor=pointer]:
                    - img [ref=e250]
                    - text: Tambah Task
              - generic [ref=e251]:
                - generic [ref=e253]:
                  - generic [ref=e254]:
                    - generic [ref=e255]:
                      - heading "Template Surat Baku HMTI" [level=3] [ref=e256]
                      - generic [ref=e257]: Milestone
                    - paragraph [ref=e258]: 100% surat/proposal menggunakan Template Baku HMTI
                  - generic [ref=e259]: 0/0 Tasks
                - generic [ref=e261]:
                  - generic [ref=e262]: Progress KPI
                  - generic [ref=e263]: 0%
                - generic [ref=e265]:
                  - paragraph [ref=e266]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e267] [cursor=pointer]:
                    - img [ref=e268]
                    - text: Tambah Task
              - generic [ref=e269]:
                - generic [ref=e271]:
                  - generic [ref=e272]:
                    - heading "LPJ Bulanan" [level=3] [ref=e274]
                    - paragraph [ref=e275]: Draft LPJ dicicil per bulan
                  - generic [ref=e276]: 0/0 Tasks
                - generic [ref=e278]:
                  - generic [ref=e279]: Progress KPI
                  - generic [ref=e280]: 0%
                - generic [ref=e282]:
                  - paragraph [ref=e283]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e284] [cursor=pointer]:
                    - img [ref=e285]
                    - text: Tambah Task
              - generic [ref=e286]:
                - generic [ref=e288]:
                  - generic [ref=e289]:
                    - generic [ref=e290]:
                      - heading "Konsep Kasar & Rulebook" [level=3] [ref=e291]
                      - generic [ref=e292]: Milestone
                    - paragraph [ref=e293]: Menyelesaikan 100% penyusunan konsep kasar, Rulebook Lomba, draft Rundown
                    - paragraph [ref=e294]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e295]: 0/0 Tasks
                - generic [ref=e297]:
                  - generic [ref=e298]: Progress KPI
                  - generic [ref=e299]: 0%
                - generic [ref=e301]:
                  - paragraph [ref=e302]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e303] [cursor=pointer]:
                    - img [ref=e304]
                    - text: Tambah Task
              - generic [ref=e305]:
                - generic [ref=e307]:
                  - generic [ref=e308]:
                    - generic [ref=e309]:
                      - heading "Modul Edukasi Roadshow" [level=3] [ref=e310]
                      - generic [ref=e311]: Milestone
                    - paragraph [ref=e312]: Fiksasi 1 Modul Edukasi Baku bersama Hannah Asa
                    - paragraph [ref=e313]: "Deadline: 31 Mei 2026"
                  - generic [ref=e314]: 0/0 Tasks
                - generic [ref=e316]:
                  - generic [ref=e317]: Progress KPI
                  - generic [ref=e318]: 0%
                - generic [ref=e320]:
                  - paragraph [ref=e321]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e322] [cursor=pointer]:
                    - img [ref=e323]
                    - text: Tambah Task
              - generic [ref=e324]:
                - generic [ref=e326]:
                  - generic [ref=e327]:
                    - generic [ref=e328]:
                      - heading "Tim Kecil Roadshow" [level=3] [ref=e329]
                      - generic [ref=e330]: Milestone
                    - paragraph [ref=e331]: Membentuk 3 Tim Kecil Roadshow dari anggota panitia lain untuk 25 titik
                    - paragraph [ref=e332]: "Deadline: 1 Agustus 2026"
                  - generic [ref=e333]: 0/0 Tasks
                - generic [ref=e335]:
                  - generic [ref=e336]: Progress KPI
                  - generic [ref=e337]: 0%
                - generic [ref=e339]:
                  - paragraph [ref=e340]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e341] [cursor=pointer]:
                    - img [ref=e342]
                    - text: Tambah Task
              - generic [ref=e343]:
                - generic [ref=e345]:
                  - generic [ref=e346]:
                    - generic [ref=e347]:
                      - heading "Draft Rulebook 5 Lomba" [level=3] [ref=e348]
                      - generic [ref=e349]: Milestone
                    - paragraph [ref=e350]: Menyelesaikan Draft Rulebook untuk 5 lomba (RAB Kasar & Aturan Lomba)
                    - paragraph [ref=e351]: "Deadline: 31 Mei 2026"
                  - generic [ref=e352]: 0/0 Tasks
                - generic [ref=e354]:
                  - generic [ref=e355]: Progress KPI
                  - generic [ref=e356]: 0%
                - generic [ref=e358]:
                  - paragraph [ref=e359]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e360] [cursor=pointer]:
                    - img [ref=e361]
                    - text: Tambah Task
              - generic [ref=e362]:
                - generic [ref=e364]:
                  - generic [ref=e365]:
                    - generic [ref=e366]:
                      - heading "Buku Saku Modul Visitasi" [level=3] [ref=e367]
                      - generic [ref=e368]: Milestone
                    - paragraph [ref=e369]: Merumuskan draft Buku Saku Modul Visitasi sebagai syarat konversi SKS
                    - paragraph [ref=e370]: "Deadline: 1 Agustus 2026"
                  - generic [ref=e371]: 0/0 Tasks
                - generic [ref=e373]:
                  - generic [ref=e374]: Progress KPI
                  - generic [ref=e375]: 0%
                - generic [ref=e377]:
                  - paragraph [ref=e378]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e379] [cursor=pointer]:
                    - img [ref=e380]
                    - text: Tambah Task
              - generic [ref=e381]:
                - generic [ref=e383]:
                  - generic [ref=e384]:
                    - heading "Audiensi Mitra Travel" [level=3] [ref=e386]
                    - paragraph [ref=e387]: Audiensi fiksasi dengan minimal 1 Mitra Travel Tour pada bulan Juni
                    - paragraph [ref=e388]: "Deadline: 30 Juni 2026"
                  - generic [ref=e389]: 0/0 Tasks
                - generic [ref=e391]:
                  - generic [ref=e392]: Progress KPI
                  - generic [ref=e393]: 0%
                - generic [ref=e395]:
                  - paragraph [ref=e396]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e397] [cursor=pointer]:
                    - img [ref=e398]
                    - text: Tambah Task
              - generic [ref=e399]:
                - generic [ref=e401]:
                  - generic [ref=e402]:
                    - generic [ref=e403]:
                      - heading "Blueprint Expo" [level=3] [ref=e404]
                      - generic [ref=e405]: Milestone
                    - paragraph [ref=e406]: Fiksasi Blueprint pembagian lapak/zonasi Paviliun S-DIH
                    - paragraph [ref=e407]: "Deadline: 1 Agustus 2026"
                  - generic [ref=e408]: 0/0 Tasks
                - generic [ref=e410]:
                  - generic [ref=e411]: Progress KPI
                  - generic [ref=e412]: 0%
                - generic [ref=e414]:
                  - paragraph [ref=e415]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e416] [cursor=pointer]:
                    - img [ref=e417]
                    - text: Tambah Task
              - generic [ref=e418]:
                - generic [ref=e420]:
                  - generic [ref=e421]:
                    - heading "Kurasi 5 Karya Inovasi" [level=3] [ref=e423]
                    - paragraph [ref=e424]: Mengkurasi minimal 5 karya Inovasi dari mahasiswa tingkat akhir JTI
                    - paragraph [ref=e425]: "Deadline: 1 November 2026"
                  - generic [ref=e426]: 0/0 Tasks
                - generic [ref=e428]:
                  - generic [ref=e429]: Progress KPI
                  - generic [ref=e430]: 0%
                - generic [ref=e432]:
                  - paragraph [ref=e433]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e434] [cursor=pointer]:
                    - img [ref=e435]
                    - text: Tambah Task
              - generic [ref=e436]:
                - generic [ref=e438]:
                  - generic [ref=e439]:
                    - heading "Response Time Medsos" [level=3] [ref=e441]
                    - paragraph [ref=e442]: Merespons interaksi via DM Instagram/Tiktok/WA maksimal 1x24 jam
                  - generic [ref=e443]: 0/0 Tasks
                - generic [ref=e445]:
                  - generic [ref=e446]: Progress KPI
                  - generic [ref=e447]: 0%
                - generic [ref=e449]:
                  - paragraph [ref=e450]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e451] [cursor=pointer]:
                    - img [ref=e452]
                    - text: Tambah Task
              - generic [ref=e453]:
                - generic [ref=e455]:
                  - generic [ref=e456]:
                    - heading "Eksekusi Surat Lintas Divisi" [level=3] [ref=e458]
                    - paragraph [ref=e459]: 100% permohonan draft surat dari divisi lain dieksekusi tanpa delay
                  - generic [ref=e460]: 0/0 Tasks
                - generic [ref=e462]:
                  - generic [ref=e463]: Progress KPI
                  - generic [ref=e464]: 0%
                - generic [ref=e466]:
                  - paragraph [ref=e467]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e468] [cursor=pointer]:
                    - img [ref=e469]
                    - text: Tambah Task
              - generic [ref=e470]:
                - generic [ref=e472]:
                  - generic [ref=e473]:
                    - generic [ref=e474]:
                      - heading "MoU Media Partner" [level=3] [ref=e475]
                      - generic [ref=e476]: Milestone
                    - paragraph [ref=e477]: Mengamankan MoU dengan minimal 15 Media Partner Lokal + 5 Nasional
                    - paragraph [ref=e478]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e479]: 0/0 Tasks
                - generic [ref=e481]:
                  - generic [ref=e482]: Progress KPI
                  - generic [ref=e483]: 0%
                - generic [ref=e485]:
                  - paragraph [ref=e486]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e487] [cursor=pointer]:
                    - img [ref=e488]
                    - text: Tambah Task
              - generic [ref=e489]:
                - generic [ref=e491]:
                  - generic [ref=e492]:
                    - heading "Distribusi Surat" [level=3] [ref=e494]
                    - paragraph [ref=e495]: Tingkat keberhasilan distribusi surat/proposal mencapai 95%
                  - generic [ref=e496]: 0/0 Tasks
                - generic [ref=e498]:
                  - generic [ref=e499]: Progress KPI
                  - generic [ref=e500]: 0%
                - generic [ref=e502]:
                  - paragraph [ref=e503]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e504] [cursor=pointer]:
                    - img [ref=e505]
                    - text: Tambah Task
              - generic [ref=e506]:
                - generic [ref=e508]:
                  - generic [ref=e509]:
                    - heading "Survei Venue" [level=3] [ref=e511]
                    - paragraph [ref=e512]: Laporan survei venue diperbarui maksimal 1x24 jam setelah dari lapangan
                  - generic [ref=e513]: 0/0 Tasks
                - generic [ref=e515]:
                  - generic [ref=e516]: Progress KPI
                  - generic [ref=e517]: 0%
                - generic [ref=e519]:
                  - paragraph [ref=e520]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e521] [cursor=pointer]:
                    - img [ref=e522]
                    - text: Tambah Task
              - generic [ref=e523]:
                - generic [ref=e525]:
                  - generic [ref=e526]:
                    - generic [ref=e527]:
                      - heading "Closing Deal Sponsor" [level=3] [ref=e528]
                      - generic [ref=e529]: Milestone
                    - paragraph [ref=e530]: Wajib hadir mendampingi Ketupat/PIC dalam Negosiasi Final sponsor Diamond & Tungsten
                    - paragraph [ref=e531]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e532]: 0/0 Tasks
                - generic [ref=e534]:
                  - generic [ref=e535]: Progress KPI
                  - generic [ref=e536]: 0%
                - generic [ref=e538]:
                  - paragraph [ref=e539]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e540] [cursor=pointer]:
                    - img [ref=e541]
                    - text: Tambah Task
              - generic [ref=e542]:
                - generic [ref=e544]:
                  - generic [ref=e545]:
                    - generic [ref=e546]:
                      - heading "Database Leads" [level=3] [ref=e547]
                      - generic [ref=e548]: Milestone
                    - paragraph [ref=e549]: Menyetorkan minimal 30 leads valid (Nama Manajer, Email HR/PR, No. Kontak)
                    - paragraph [ref=e550]: "Deadline: 30 Juni 2026"
                  - generic [ref=e551]: 0/0 Tasks
                - generic [ref=e553]:
                  - generic [ref=e554]: Progress KPI
                  - generic [ref=e555]: 0%
                - generic [ref=e557]:
                  - paragraph [ref=e558]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e559] [cursor=pointer]:
                    - img [ref=e560]
                    - text: Tambah Task
              - generic [ref=e561]:
                - generic [ref=e563]:
                  - generic [ref=e564]:
                    - heading "Proposal Kustom" [level=3] [ref=e566]
                    - paragraph [ref=e567]: 100% proposal VIP/BUMN/Instansi telah di-kustomisasi (logo perusahaan + nama direktur)
                  - generic [ref=e568]: 0/0 Tasks
                - generic [ref=e570]:
                  - generic [ref=e571]: Progress KPI
                  - generic [ref=e572]: 0%
                - generic [ref=e574]:
                  - paragraph [ref=e575]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e576] [cursor=pointer]:
                    - img [ref=e577]
                    - text: Tambah Task
              - generic [ref=e578]:
                - generic [ref=e580]:
                  - generic [ref=e581]:
                    - heading "Distribusi Proposal Fisik" [level=3] [ref=e583]
                    - paragraph [ref=e584]: 100% proposal fisik terdistribusi dengan follow-up H+3 dan H+7
                    - paragraph [ref=e585]: "Deadline: 1 Agustus 2026"
                  - generic [ref=e586]: 0/0 Tasks
                - generic [ref=e588]:
                  - generic [ref=e589]: Progress KPI
                  - generic [ref=e590]: 0%
                - generic [ref=e592]:
                  - paragraph [ref=e593]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e594] [cursor=pointer]:
                    - img [ref=e595]
                    - text: Tambah Task
              - generic [ref=e596]:
                - generic [ref=e598]:
                  - generic [ref=e599]:
                    - heading "QC Visual Sponsor" [level=3] [ref=e601]
                    - paragraph [ref=e602]: 0% komplain sponsor terkait peletakan logo, ad-libs MC, booth
                  - generic [ref=e603]: 0/0 Tasks
                - generic [ref=e605]:
                  - generic [ref=e606]: Progress KPI
                  - generic [ref=e607]: 0%
                - generic [ref=e609]:
                  - paragraph [ref=e610]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e611] [cursor=pointer]:
                    - img [ref=e612]
                    - text: Tambah Task
              - generic [ref=e613]:
                - generic [ref=e615]:
                  - generic [ref=e616]:
                    - generic [ref=e617]:
                      - heading "LPJ & Plakat Sponsor" [level=3] [ref=e618]
                      - generic [ref=e619]: Milestone
                    - paragraph [ref=e620]: Menyerahkan LPJ dan Plakat Apresiasi ke mitra maksimal H+14
                    - paragraph [ref=e621]: "Deadline: 14 November 2026"
                  - generic [ref=e622]: 0/0 Tasks
                - generic [ref=e624]:
                  - generic [ref=e625]: Progress KPI
                  - generic [ref=e626]: 0%
                - generic [ref=e628]:
                  - paragraph [ref=e629]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e630] [cursor=pointer]:
                    - img [ref=e631]
                    - text: Tambah Task
              - generic [ref=e632]:
                - generic [ref=e634]:
                  - generic [ref=e635]:
                    - heading "Konsistensi Brand" [level=3] [ref=e637]
                    - paragraph [ref=e638]: 100% output desain selaras dengan Brand Guidelines (KV) dari Buta Warna
                  - generic [ref=e639]: 0/0 Tasks
                - generic [ref=e641]:
                  - generic [ref=e642]: Progress KPI
                  - generic [ref=e643]: 0%
                - generic [ref=e645]:
                  - paragraph [ref=e646]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e647] [cursor=pointer]:
                    - img [ref=e648]
                    - text: Tambah Task
              - generic [ref=e649]:
                - generic [ref=e651]:
                  - generic [ref=e652]:
                    - heading "Zero Bottleneck Buta Warna" [level=3] [ref=e654]
                    - paragraph [ref=e655]: Tidak ada keterlambatan revisi komunikasi dengan tim Buta Warna
                  - generic [ref=e656]: 0/0 Tasks
                - generic [ref=e658]:
                  - generic [ref=e659]: Progress KPI
                  - generic [ref=e660]: 0%
                - generic [ref=e662]:
                  - paragraph [ref=e663]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e664] [cursor=pointer]:
                    - img [ref=e665]
                    - text: Tambah Task
              - generic [ref=e666]:
                - generic [ref=e668]:
                  - generic [ref=e669]:
                    - generic [ref=e670]:
                      - heading "Content Calendar Bulanan" [level=3] [ref=e671]
                      - generic [ref=e672]: Milestone
                    - paragraph [ref=e673]: Merilis Content Calendar selambatnya H-7 sebelum bulan baru
                  - generic [ref=e674]: 0/0 Tasks
                - generic [ref=e676]:
                  - generic [ref=e677]: Progress KPI
                  - generic [ref=e678]: 0%
                - generic [ref=e680]:
                  - paragraph [ref=e681]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e682] [cursor=pointer]:
                    - img [ref=e683]
                    - text: Tambah Task
              - generic [ref=e684]:
                - generic [ref=e686]:
                  - generic [ref=e687]:
                    - heading "Final Video H-2" [level=3] [ref=e689]
                    - paragraph [ref=e690]: Video promo/edukasi diserahkan maksimal H-2 dari jadwal tayang
                  - generic [ref=e691]: 0/0 Tasks
                - generic [ref=e693]:
                  - generic [ref=e694]: Progress KPI
                  - generic [ref=e695]: 0%
                - generic [ref=e697]:
                  - paragraph [ref=e698]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e699] [cursor=pointer]:
                    - img [ref=e700]
                    - text: Tambah Task
              - generic [ref=e701]:
                - generic [ref=e703]:
                  - generic [ref=e704]:
                    - heading "Desain Turunan 100%" [level=3] [ref=e706]
                    - paragraph [ref=e707]: 100% pemenuhan desain turunan tanpa mengubah Key Visual utama
                  - generic [ref=e708]: 0/0 Tasks
                - generic [ref=e710]:
                  - generic [ref=e711]: Progress KPI
                  - generic [ref=e712]: 0%
                - generic [ref=e714]:
                  - paragraph [ref=e715]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e716] [cursor=pointer]:
                    - img [ref=e717]
                    - text: Tambah Task
              - generic [ref=e718]:
                - generic [ref=e720]:
                  - generic [ref=e721]:
                    - generic [ref=e722]:
                      - heading "Cetak Biru Dekorasi" [level=3] [ref=e723]
                      - generic [ref=e724]: Milestone
                    - paragraph [ref=e725]: Mengesahkan Cetak Biru Dekorasi Venue dan RAB Estetika
                    - paragraph [ref=e726]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e727]: 0/0 Tasks
                - generic [ref=e729]:
                  - generic [ref=e730]: Progress KPI
                  - generic [ref=e731]: 0%
                - generic [ref=e733]:
                  - paragraph [ref=e734]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e735] [cursor=pointer]:
                    - img [ref=e736]
                    - text: Tambah Task
              - generic [ref=e737]:
                - generic [ref=e739]:
                  - generic [ref=e740]:
                    - heading "Backup Dokumentasi" [level=3] [ref=e742]
                    - paragraph [ref=e743]: 100% file mentah dokumentasi tercadang maksimal 1x24 jam
                  - generic [ref=e744]: 0/0 Tasks
                - generic [ref=e746]:
                  - generic [ref=e747]: Progress KPI
                  - generic [ref=e748]: 0%
                - generic [ref=e750]:
                  - paragraph [ref=e751]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e752] [cursor=pointer]:
                    - img [ref=e753]
                    - text: Tambah Task
              - generic [ref=e754]:
                - generic [ref=e756]:
                  - generic [ref=e757]:
                    - generic [ref=e758]:
                      - heading "Target Dana Usaha" [level=3] [ref=e759]
                      - generic [ref=e760]: Milestone
                    - paragraph [ref=e761]: Memenuhi 100% target Dana Usaha (Rp 28-31 Juta)
                    - paragraph [ref=e762]: "Deadline: 14 Oktober 2026"
                  - generic [ref=e763]: 0/0 Tasks
                - generic [ref=e765]:
                  - generic [ref=e766]: Progress KPI
                  - generic [ref=e767]: 0%
                - generic [ref=e769]:
                  - paragraph [ref=e770]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e771] [cursor=pointer]:
                    - img [ref=e772]
                    - text: Tambah Task
              - generic [ref=e773]:
                - generic [ref=e775]:
                  - generic [ref=e776]:
                    - heading "Zero Loss Keuangan" [level=3] [ref=e778]
                    - paragraph [ref=e779]: 0% selisih antara jumlah kupon/barang terjual dengan kas
                  - generic [ref=e780]: 0/0 Tasks
                - generic [ref=e782]:
                  - generic [ref=e783]: Progress KPI
                  - generic [ref=e784]: 0%
                - generic [ref=e786]:
                  - paragraph [ref=e787]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e788] [cursor=pointer]:
                    - img [ref=e789]
                    - text: Tambah Task
              - generic [ref=e790]:
                - generic [ref=e792]:
                  - generic [ref=e793]:
                    - heading "Target Penjualan Rutin" [level=3] [ref=e795]
                    - paragraph [ref=e796]: 200-320 pcs dessert/minggu & 25-40 paket lunch/minggu
                  - generic [ref=e797]: 0/0 Tasks
                - generic [ref=e799]:
                  - generic [ref=e800]: Progress KPI
                  - generic [ref=e801]: 0%
                - generic [ref=e803]:
                  - paragraph [ref=e804]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e805] [cursor=pointer]:
                    - img [ref=e806]
                    - text: Tambah Task
              - generic [ref=e807]:
                - generic [ref=e809]:
                  - generic [ref=e810]:
                    - generic [ref=e811]:
                      - heading "Produksi Merchandise" [level=3] [ref=e812]
                      - generic [ref=e813]: Milestone
                    - paragraph [ref=e814]: Menyelesaikan produksi Merchandise Chapter 1 & 2 secara Pre-Order tanpa overstok
                    - paragraph [ref=e815]: "Deadline: 1 Agustus 2026"
                  - generic [ref=e816]: 0/0 Tasks
                - generic [ref=e818]:
                  - generic [ref=e819]: Progress KPI
                  - generic [ref=e820]: 0%
                - generic [ref=e822]:
                  - paragraph [ref=e823]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e824] [cursor=pointer]:
                    - img [ref=e825]
                    - text: Tambah Task
              - generic [ref=e826]:
                - generic [ref=e828]:
                  - generic [ref=e829]:
                    - heading "DP Tenant UMKM" [level=3] [ref=e831]
                    - paragraph [ref=e832]: Mengamankan DP 50% dari 15-30 Tenant UMKM
                    - paragraph [ref=e833]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e834]: 0/0 Tasks
                - generic [ref=e836]:
                  - generic [ref=e837]: Progress KPI
                  - generic [ref=e838]: 0%
                - generic [ref=e840]:
                  - paragraph [ref=e841]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e842] [cursor=pointer]:
                    - img [ref=e843]
                    - text: Tambah Task
              - generic [ref=e844]:
                - generic [ref=e846]:
                  - generic [ref=e847]:
                    - generic [ref=e848]:
                      - heading "Fiksasi Vendor Catering" [level=3] [ref=e849]
                      - generic [ref=e850]: Milestone
                    - paragraph [ref=e851]: Mengesahkan RAB detail Konsumsi dan fiksasi 100% vendor
                    - paragraph [ref=e852]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e853]: 0/0 Tasks
                - generic [ref=e855]:
                  - generic [ref=e856]: Progress KPI
                  - generic [ref=e857]: 0%
                - generic [ref=e859]:
                  - paragraph [ref=e860]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e861] [cursor=pointer]:
                    - img [ref=e862]
                    - text: Tambah Task
              - generic [ref=e863]:
                - generic [ref=e865]:
                  - generic [ref=e866]:
                    - heading "Riders VIP" [level=3] [ref=e868]
                    - paragraph [ref=e869]: Menyediakan riders konsumsi artis/VIP 100% sesuai permintaan
                  - generic [ref=e870]: 0/0 Tasks
                - generic [ref=e872]:
                  - generic [ref=e873]: Progress KPI
                  - generic [ref=e874]: 0%
                - generic [ref=e876]:
                  - paragraph [ref=e877]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e878] [cursor=pointer]:
                    - img [ref=e879]
                    - text: Tambah Task
              - generic [ref=e880]:
                - generic [ref=e882]:
                  - generic [ref=e883]:
                    - heading "Distribusi Ransum" [level=3] [ref=e885]
                    - paragraph [ref=e886]: 0% panitia/relawan yang tidak mendapat jatah makan
                  - generic [ref=e887]: 0/0 Tasks
                - generic [ref=e889]:
                  - generic [ref=e890]: Progress KPI
                  - generic [ref=e891]: 0%
                - generic [ref=e893]:
                  - paragraph [ref=e894]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e895] [cursor=pointer]:
                    - img [ref=e896]
                    - text: Tambah Task
              - generic [ref=e897]:
                - generic [ref=e899]:
                  - generic [ref=e900]:
                    - heading "Loading Konsumsi" [level=3] [ref=e902]
                    - paragraph [ref=e903]: Loading ribuan boks makanan dari vendor ke ruang penyimpanan < 30 menit
                  - generic [ref=e904]: 0/0 Tasks
                - generic [ref=e906]:
                  - generic [ref=e907]: Progress KPI
                  - generic [ref=e908]: 0%
                - generic [ref=e910]:
                  - paragraph [ref=e911]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e912] [cursor=pointer]:
                    - img [ref=e913]
                    - text: Tambah Task
              - generic [ref=e914]:
                - generic [ref=e916]:
                  - generic [ref=e917]:
                    - heading "Kesiapan Properti Roadshow" [level=3] [ref=e919]
                    - paragraph [ref=e920]: 100% properti Roadshow sedia H-1 sebelum keberangkatan
                  - generic [ref=e921]: 0/0 Tasks
                - generic [ref=e923]:
                  - generic [ref=e924]: Progress KPI
                  - generic [ref=e925]: 0%
                - generic [ref=e927]:
                  - paragraph [ref=e928]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e929] [cursor=pointer]:
                    - img [ref=e930]
                    - text: Tambah Task
              - generic [ref=e931]:
                - generic [ref=e933]:
                  - generic [ref=e934]:
                    - generic [ref=e935]:
                      - heading "Pengembalian Barang Pinjaman" [level=3] [ref=e936]
                      - generic [ref=e937]: Milestone
                    - paragraph [ref=e938]: 100% barang pinjaman HMTI/Fakultas kembali H+3 tanpa hilang/rusak
                    - paragraph [ref=e939]: "Deadline: 13 November 2026"
                  - generic [ref=e940]: 0/0 Tasks
                - generic [ref=e942]:
                  - generic [ref=e943]: Progress KPI
                  - generic [ref=e944]: 0%
                - generic [ref=e946]:
                  - paragraph [ref=e947]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e948] [cursor=pointer]:
                    - img [ref=e949]
                    - text: Tambah Task
              - generic [ref=e950]:
                - generic [ref=e952]:
                  - generic [ref=e953]:
                    - heading "Verifikasi Anggaran Barang" [level=3] [ref=e955]
                    - paragraph [ref=e956]: 100% RAB Barang terverifikasi urgensinya
                  - generic [ref=e957]: 0/0 Tasks
                - generic [ref=e959]:
                  - generic [ref=e960]: Progress KPI
                  - generic [ref=e961]: 0%
                - generic [ref=e963]:
                  - paragraph [ref=e964]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e965] [cursor=pointer]:
                    - img [ref=e966]
                    - text: Tambah Task
              - generic [ref=e967]:
                - generic [ref=e969]:
                  - generic [ref=e970]:
                    - heading "Pengecekan Alat H-2" [level=3] [ref=e972]
                    - paragraph [ref=e973]: Memastikan fungsi alat (HT, kabel) pada H-2 sebelum diserahkan
                  - generic [ref=e974]: 0/0 Tasks
                - generic [ref=e976]:
                  - generic [ref=e977]: Progress KPI
                  - generic [ref=e978]: 0%
                - generic [ref=e980]:
                  - paragraph [ref=e981]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e982] [cursor=pointer]:
                    - img [ref=e983]
                    - text: Tambah Task
              - generic [ref=e984]:
                - generic [ref=e986]:
                  - generic [ref=e987]:
                    - generic [ref=e988]:
                      - heading "Area Venue Siap H-1" [level=3] [ref=e989]
                      - generic [ref=e990]: Milestone
                    - paragraph [ref=e991]: Area venue 100% siap operasional maksimal H-1
                  - generic [ref=e992]: 0/0 Tasks
                - generic [ref=e994]:
                  - generic [ref=e995]: Progress KPI
                  - generic [ref=e996]: 0%
                - generic [ref=e998]:
                  - paragraph [ref=e999]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1000] [cursor=pointer]:
                    - img [ref=e1001]
                    - text: Tambah Task
              - generic [ref=e1002]:
                - generic [ref=e1004]:
                  - generic [ref=e1005]:
                    - generic [ref=e1006]:
                      - heading "Cetak Biru Keamanan Ring 1" [level=3] [ref=e1007]
                      - generic [ref=e1008]: Milestone
                    - paragraph [ref=e1009]: Mengesahkan Cetak Biru lapis keamanan fisik Ring 1
                    - paragraph [ref=e1010]: "Deadline: 14 Oktober 2026"
                  - generic [ref=e1011]: 0/0 Tasks
                - generic [ref=e1013]:
                  - generic [ref=e1014]: Progress KPI
                  - generic [ref=e1015]: 0%
                - generic [ref=e1017]:
                  - paragraph [ref=e1018]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1019] [cursor=pointer]:
                    - img [ref=e1020]
                    - text: Tambah Task
              - generic [ref=e1021]:
                - generic [ref=e1023]:
                  - generic [ref=e1024]:
                    - heading "Navigasi VIP" [level=3] [ref=e1026]
                    - paragraph [ref=e1027]: 100% tamu VVIP tiba di kursi/ruang transit tanpa tersesat
                  - generic [ref=e1028]: 0/0 Tasks
                - generic [ref=e1030]:
                  - generic [ref=e1031]: Progress KPI
                  - generic [ref=e1032]: 0%
                - generic [ref=e1034]:
                  - paragraph [ref=e1035]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1036] [cursor=pointer]:
                    - img [ref=e1037]
                    - text: Tambah Task
              - generic [ref=e1038]:
                - generic [ref=e1040]:
                  - generic [ref=e1041]:
                    - heading "Delay Taktis Maksimal 3 Menit" [level=3] [ref=e1043]
                    - paragraph [ref=e1044]: Delay maksimal 3 menit sejak perintah dikeluarkan oleh Koor Lapangan
                  - generic [ref=e1045]: 0/0 Tasks
                - generic [ref=e1047]:
                  - generic [ref=e1048]: Progress KPI
                  - generic [ref=e1049]: 0%
                - generic [ref=e1051]:
                  - paragraph [ref=e1052]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1053] [cursor=pointer]:
                    - img [ref=e1054]
                    - text: Tambah Task
              - generic [ref=e1055]:
                - generic [ref=e1057]:
                  - generic [ref=e1058]:
                    - heading "0% Penumpukan Massa" [level=3] [ref=e1060]
                    - paragraph [ref=e1061]: 0% bottleneck fatal di area registrasi dan lorong Expo
                  - generic [ref=e1062]: 0/0 Tasks
                - generic [ref=e1064]:
                  - generic [ref=e1065]: Progress KPI
                  - generic [ref=e1066]: 0%
                - generic [ref=e1068]:
                  - paragraph [ref=e1069]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1070] [cursor=pointer]:
                    - img [ref=e1071]
                    - text: Tambah Task
              - generic [ref=e1072]:
                - generic [ref=e1074]:
                  - generic [ref=e1075]:
                    - generic [ref=e1076]:
                      - heading "Backup Genset" [level=3] [ref=e1077]
                      - generic [ref=e1078]: Milestone
                    - paragraph [ref=e1079]: 0% insiden listrik anjlok dengan menyiapkan backup genset
                    - paragraph [ref=e1080]: "Deadline: 28 Oktober 2026"
                  - generic [ref=e1081]: 0/0 Tasks
                - generic [ref=e1083]:
                  - generic [ref=e1084]: Progress KPI
                  - generic [ref=e1085]: 0%
                - generic [ref=e1087]:
                  - paragraph [ref=e1088]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1089] [cursor=pointer]:
                    - img [ref=e1090]
                    - text: Tambah Task
              - generic [ref=e1091]:
                - generic [ref=e1093]:
                  - generic [ref=e1094]:
                    - heading "Changeover Panggung" [level=3] [ref=e1096]
                    - paragraph [ref=e1097]: 0% kendala posisi kursi/meja saat narasumber di atas panggung
                  - generic [ref=e1098]: 0/0 Tasks
                - generic [ref=e1100]:
                  - generic [ref=e1101]: Progress KPI
                  - generic [ref=e1102]: 0%
                - generic [ref=e1104]:
                  - paragraph [ref=e1105]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1106] [cursor=pointer]:
                    - img [ref=e1107]
                    - text: Tambah Task
              - generic [ref=e1108]:
                - generic [ref=e1110]:
                  - generic [ref=e1111]:
                    - generic [ref=e1112]:
                      - heading "Personel Keamanan Eksternal" [level=3] [ref=e1113]
                      - generic [ref=e1114]: Milestone
                    - paragraph [ref=e1115]: Mengamankan minimal 20 personel keamanan eksternal (Menwa/Polisi)
                    - paragraph [ref=e1116]: "Deadline: 1 Oktober 2026"
                  - generic [ref=e1117]: 0/0 Tasks
                - generic [ref=e1119]:
                  - generic [ref=e1120]: Progress KPI
                  - generic [ref=e1121]: 0%
                - generic [ref=e1123]:
                  - paragraph [ref=e1124]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1125] [cursor=pointer]:
                    - img [ref=e1126]
                    - text: Tambah Task
              - generic [ref=e1127]:
                - generic [ref=e1129]:
                  - generic [ref=e1130]:
                    - heading "Sterilisasi Backstage" [level=3] [ref=e1132]
                    - paragraph [ref=e1133]: Mencegah penyusup tanpa ID Card/Gelang Akses khusus
                  - generic [ref=e1134]: 0/0 Tasks
                - generic [ref=e1136]:
                  - generic [ref=e1137]: Progress KPI
                  - generic [ref=e1138]: 0%
                - generic [ref=e1140]:
                  - paragraph [ref=e1141]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1142] [cursor=pointer]:
                    - img [ref=e1143]
                    - text: Tambah Task
              - generic [ref=e1144]:
                - generic [ref=e1146]:
                  - generic [ref=e1147]:
                    - heading "0% Kebocoran Tiket" [level=3] [ref=e1149]
                    - paragraph [ref=e1150]: 0% penonton tanpa tiket masuk
                  - generic [ref=e1151]: 0/0 Tasks
                - generic [ref=e1153]:
                  - generic [ref=e1154]: Progress KPI
                  - generic [ref=e1155]: 0%
                - generic [ref=e1157]:
                  - paragraph [ref=e1158]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1159] [cursor=pointer]:
                    - img [ref=e1160]
                    - text: Tambah Task
              - generic [ref=e1161]:
                - generic [ref=e1163]:
                  - generic [ref=e1164]:
                    - heading "Keamanan Roadshow" [level=3] [ref=e1166]
                    - paragraph [ref=e1167]: 0 insiden keselamatan saat 25 titik Roadshow
                  - generic [ref=e1168]: 0/0 Tasks
                - generic [ref=e1170]:
                  - generic [ref=e1171]: Progress KPI
                  - generic [ref=e1172]: 0%
                - generic [ref=e1174]:
                  - paragraph [ref=e1175]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1176] [cursor=pointer]:
                    - img [ref=e1177]
                    - text: Tambah Task
              - generic [ref=e1178]:
                - generic [ref=e1180]:
                  - generic [ref=e1181]:
                    - heading "Posko P3K" [level=3] [ref=e1183]
                    - paragraph [ref=e1184]: Menyiapkan posko P3K dan jalur darurat
                  - generic [ref=e1185]: 0/0 Tasks
                - generic [ref=e1187]:
                  - generic [ref=e1188]: Progress KPI
                  - generic [ref=e1189]: 0%
                - generic [ref=e1191]:
                  - paragraph [ref=e1192]: Belum ada task ditambahkan.
                  - button "Tambah Task" [ref=e1193] [cursor=pointer]:
                    - img [ref=e1194]
                    - text: Tambah Task
  - button "Open Next.js Dev Tools" [ref=e1200] [cursor=pointer]:
    - img [ref=e1201]
  - alert [ref=e1204]
```

# Test source

```ts
  55  |   });
  56  | 
  57  |   test('should return to dashboard from any page', async ({ page }) => {
  58  |     await page.goto('/dashboard/letters');
  59  |     await page.click('a[href="/dashboard"]');
  60  |     await expect(page).toHaveURL('/dashboard');
  61  |   });
  62  | });
  63  | 
  64  | test.describe('Navigation - Letters Routes', () => {
  65  |   test.beforeEach(async ({ page }) => {
  66  |     await loginAs(page, 'member');
  67  |   });
  68  | 
  69  |   test('should navigate to new letter form', async ({ page }) => {
  70  |     await page.goto('/dashboard/letters');
  71  |     await page.click('a[href="/dashboard/letters/new"]');
  72  |     await expect(page).toHaveURL('/dashboard/letters/new');
  73  |     await expect(page.locator('text=/surat baru|new letter/i')).toBeVisible();
  74  |   });
  75  | 
  76  |   test('should navigate to letter detail', async ({ page }) => {
  77  |     await page.goto('/dashboard/letters');
  78  |     await page.click('[data-testid="letter-item"]');
  79  |     await expect(page).toHaveURL(/\/dashboard\/letters\/[a-z0-9-]+/);
  80  |   });
  81  | 
  82  |   test('should navigate back to letters list from detail', async ({ page }) => {
  83  |     await page.goto('/dashboard/letters');
  84  |     await page.click('[data-testid="letter-item"]');
  85  |     await page.click('button:has-text("Kembali")');
  86  |     await expect(page).toHaveURL('/dashboard/letters');
  87  |   });
  88  | 
  89  |   test('should navigate to letter edit from detail', async ({ page }) => {
  90  |     await page.goto('/dashboard/letters');
  91  |     await page.click('[data-testid="letter-item"]');
  92  |     await page.click('button:has-text("Edit")');
  93  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  94  |   });
  95  | 
  96  |   test('should filter by letter status', async ({ page }) => {
  97  |     await page.goto('/dashboard/letters');
  98  |     await page.click('[data-testid="filter-requested"]');
  99  |     await expect(page).toHaveURL(/status=requested/);
  100 |   });
  101 | });
  102 | 
  103 | test.describe('Navigation - Meetings Routes', () => {
  104 |   test.beforeEach(async ({ page }) => {
  105 |     await loginAs(page, 'member');
  106 |   });
  107 | 
  108 |   test('should navigate to new meeting form', async ({ page }) => {
  109 |     await page.goto('/dashboard/meetings');
  110 |     await page.click('a[href="/dashboard/meetings/new"]');
  111 |     await expect(page).toHaveURL('/dashboard/meetings/new');
  112 |     await expect(page.locator('text=/rapat baru|new meeting/i')).toBeVisible();
  113 |   });
  114 | 
  115 |   test('should navigate to meeting detail', async ({ page }) => {
  116 |     await page.goto('/dashboard/meetings');
  117 |     await page.click('[data-testid="meeting-item"]');
  118 |     await expect(page).toHaveURL(/\/dashboard\/meetings\/[a-z0-9-]+/);
  119 |   });
  120 | 
  121 |   test('should navigate to meeting notes from detail', async ({ page }) => {
  122 |     await page.goto('/dashboard/meetings');
  123 |     await page.click('[data-testid="meeting-item"]');
  124 |     await page.click('[data-testid="notes-tab"]');
  125 |     await expect(page).toHaveURL(/\/dashboard\/meetings\/[a-z0-9-]+/);
  126 |     await expect(page.locator('text=/notulensi|notes/i')).toBeVisible();
  127 |   });
  128 | 
  129 |   test('should navigate back to meetings list', async ({ page }) => {
  130 |     await page.goto('/dashboard/meetings/new');
  131 |     await page.click('button:has-text("Batal")');
  132 |     await expect(page).toHaveURL('/dashboard/meetings');
  133 |   });
  134 | 
  135 |   test('should filter meetings by status', async ({ page }) => {
  136 |     await page.goto('/dashboard/meetings');
  137 |     await page.click('[data-testid="filter-upcoming"]');
  138 |     await expect(page).toHaveURL(/filter=upcoming/);
  139 |   });
  140 | });
  141 | 
  142 | test.describe('Navigation - KPI Routes', () => {
  143 |   test.beforeEach(async ({ page }) => {
  144 |     await loginAs(page, 'member');
  145 |   });
  146 | 
  147 |   test('should navigate from dashboard to KPI', async ({ page }) => {
  148 |     await page.goto('/dashboard');
  149 |     await page.click('a[href="/dashboard/kpi"]');
  150 |     await expect(page).toHaveURL('/dashboard/kpi');
  151 |   });
  152 | 
  153 |   test('should expand KPI to see tasks', async ({ page }) => {
  154 |     await page.goto('/dashboard/kpi');
> 155 |     await page.click('[data-testid="kpi-item"]');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
  156 |     await expect(page.locator('[data-testid="task-item"]')).toBeVisible();
  157 |   });
  158 | 
  159 |   test('should navigate to task detail', async ({ page }) => {
  160 |     await page.goto('/dashboard/kpi');
  161 |     await page.click('[data-testid="kpi-item"]');
  162 |     await page.click('[data-testid="task-item"]');
  163 |     await expect(page.locator('[data-testid="task-title"]')).toBeVisible();
  164 |   });
  165 | 
  166 |   test('should navigate back to KPI list', async ({ page }) => {
  167 |     await page.goto('/dashboard/kpi');
  168 |     await page.click('[data-testid="kpi-item"]');
  169 |     await page.click('button:has-text("Kembali")');
  170 |     await expect(page).toHaveURL('/dashboard/kpi');
  171 |   });
  172 | });
  173 | 
  174 | test.describe('Navigation - Admin Routes', () => {
  175 |   test.beforeEach(async ({ page }) => {
  176 |     await loginAs(page, 'admin');
  177 |   });
  178 | 
  179 |   test('should navigate to admin dashboard', async ({ page }) => {
  180 |     await page.goto('/admin');
  181 |     await expect(page).toHaveURL('/admin');
  182 |     await expect(page.locator('text=/admin/i')).toBeVisible();
  183 |   });
  184 | 
  185 |   test('should navigate to admin roles', async ({ page }) => {
  186 |     await page.goto('/admin');
  187 |     await page.click('a[href="/admin/roles"]');
  188 |     await expect(page).toHaveURL('/admin/roles');
  189 |   });
  190 | 
  191 |   test('should navigate to admin divisions', async ({ page }) => {
  192 |     await page.goto('/admin');
  193 |     await page.click('a[href="/admin/divisions"]');
  194 |     await expect(page).toHaveURL('/admin/divisions');
  195 |   });
  196 | 
  197 |   test('should navigate to admin assignments', async ({ page }) => {
  198 |     await page.goto('/admin');
  199 |     await page.click('a[href="/admin/assignments"]');
  200 |     await expect(page).toHaveURL('/admin/assignments');
  201 |   });
  202 | 
  203 |   test('should navigate to admin years', async ({ page }) => {
  204 |     await page.goto('/admin');
  205 |     await page.click('a[href="/admin/years"]');
  206 |     await expect(page).toHaveURL('/admin/years');
  207 |   });
  208 | 
  209 |   test('should navigate back to dashboard from admin', async ({ page }) => {
  210 |     await page.goto('/admin');
  211 |     await page.click('a[href="/dashboard"]');
  212 |     await expect(page).toHaveURL('/dashboard');
  213 |   });
  214 | });
  215 | 
  216 | test.describe('Navigation - Auth Routes', () => {
  217 |   test('should navigate to login page from home', async ({ page }) => {
  218 |     await page.goto('/');
  219 |     await page.click('a[href="/login"]');
  220 |     await expect(page).toHaveURL('/login');
  221 |   });
  222 | 
  223 |   test('should navigate to dashboard after login', async ({ page }) => {
  224 |     await loginAs(page, 'member');
  225 |     await expect(page).toHaveURL('/dashboard');
  226 |   });
  227 | 
  228 |   test('should navigate to register page', async ({ page }) => {
  229 |     await page.goto('/login');
  230 |     await page.click('a[href="/register"]');
  231 |     await expect(page).toHaveURL('/register');
  232 |   });
  233 | 
  234 |   test('should logout and return to login', async ({ page }) => {
  235 |     await loginAs(page, 'member');
  236 |     await page.goto('/dashboard');
  237 |     await page.click('[data-testid="logout-button"]');
  238 |     await expect(page).toHaveURL('/login');
  239 |   });
  240 | });
  241 | 
  242 | test.describe('Redirect - Post-Action', () => {
  243 |   test('should redirect to letters list after creating letter', async ({ page }) => {
  244 |     await loginAs(page, 'member');
  245 |     await page.goto('/dashboard/letters/new');
  246 |     await page.selectOption('select[name="letterType"]', { index: 1 });
  247 |     await page.fill('input[name="subject"]', 'Test Redirect');
  248 |     await page.fill('textarea[name="body"]', 'Test body');
  249 |     await page.click('button[type="submit"]');
  250 | 
  251 |     await waitForToast(page, 'Surat berhasil diajukan');
  252 |     await expect(page).toHaveURL('/dashboard/letters');
  253 |   });
  254 | 
  255 |   test('should redirect to meetings list after creating meeting', async ({ page }) => {
```