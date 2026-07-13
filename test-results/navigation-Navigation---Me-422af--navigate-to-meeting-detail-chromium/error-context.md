# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Meetings Routes >> should navigate to meeting detail
- Location: tests\e2e\navigation.spec.ts:115:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('[data-testid="meeting-item"]')

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
          - link "RAPAT" [ref=e31] [cursor=pointer]:
            - /url: /dashboard/meetings
            - generic [ref=e32]:
              - img [ref=e33]
              - generic [ref=e35]: RAPAT
            - img [ref=e36]
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
          - generic [ref=e60]: 13.37.49
        - button [ref=e62]:
          - img [ref=e63]
      - main [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - paragraph [ref=e70]: Meeting Planner
              - heading "Rapat Kepanitiaan" [level=1] [ref=e71]
              - paragraph [ref=e72]: Rencanakan rapat, bagikan agenda, dan kelola notula rapat.
            - generic [ref=e73]:
              - button "Export CSV" [ref=e74]:
                - img [ref=e75]
                - text: Export CSV
              - link "Buat Rapat" [ref=e79] [cursor=pointer]:
                - /url: /dashboard/meetings/new
                - button "Buat Rapat" [ref=e80]:
                  - img [ref=e81]
                  - text: Buat Rapat
          - generic [ref=e82]:
            - generic [ref=e83]:
              - generic [ref=e84]: "0"
              - generic [ref=e85]: Berlangsung
            - generic [ref=e89]:
              - generic [ref=e90]: "0"
              - generic [ref=e91]: Akan Datang
            - generic [ref=e92]:
              - generic [ref=e93]: "2"
              - generic [ref=e94]: Selesai
          - generic [ref=e95]:
            - generic [ref=e96]:
              - img [ref=e97]
              - heading "Jadwal Pertemuan" [level=2] [ref=e99]
            - generic [ref=e100]:
              - button "Daftar" [ref=e101] [cursor=pointer]:
                - img [ref=e102]
                - text: Daftar
              - button "Kalender" [ref=e103] [cursor=pointer]:
                - img [ref=e104]
                - text: Kalender
          - generic [ref=e107]:
            - generic [ref=e109]:
              - img [ref=e110]
              - generic [ref=e113]: Rapat Selesai
              - generic [ref=e114]: "2"
            - generic [ref=e116]:
              - link "Sudah Selesai Terjadwal Rapat Internal Minggu, 12 Juli 2026 Pukul 03.30 WITA Server HMTI 19 peserta Seluruh Panitia" [ref=e117] [cursor=pointer]:
                - /url: /dashboard/meetings/de217ee3-7503-41f3-9d35-4759eea733d9
                - generic [ref=e120]:
                  - generic [ref=e122]:
                    - generic [ref=e123]:
                      - img [ref=e124]
                      - text: Sudah Selesai
                    - generic [ref=e127]: Terjadwal
                  - heading "Rapat Internal" [level=3] [ref=e129]
                  - generic [ref=e130]:
                    - generic [ref=e131]:
                      - img [ref=e132]
                      - generic [ref=e135]: Minggu, 12 Juli 2026
                    - generic [ref=e136]: Pukul 03.30 WITA
                  - generic [ref=e137]:
                    - generic [ref=e138]:
                      - generic [ref=e139]:
                        - img [ref=e140]
                        - text: Server HMTI
                      - generic [ref=e143]:
                        - img [ref=e144]
                        - text: 19 peserta
                    - generic [ref=e149]: Seluruh Panitia
              - link "Sudah Selesai Terjadwal Rapat Internal Minggu, 12 Juli 2026 Pukul 03.30 WITA Server HMTI 16 peserta Terbatas" [ref=e150] [cursor=pointer]:
                - /url: /dashboard/meetings/29c71d1a-3705-4944-af83-15446a2b371b
                - generic [ref=e153]:
                  - generic [ref=e155]:
                    - generic [ref=e156]:
                      - img [ref=e157]
                      - text: Sudah Selesai
                    - generic [ref=e160]: Terjadwal
                  - heading "Rapat Internal" [level=3] [ref=e162]
                  - generic [ref=e163]:
                    - generic [ref=e164]:
                      - img [ref=e165]
                      - generic [ref=e168]: Minggu, 12 Juli 2026
                    - generic [ref=e169]: Pukul 03.30 WITA
                  - generic [ref=e170]:
                    - generic [ref=e171]:
                      - generic [ref=e172]:
                        - img [ref=e173]
                        - text: Server HMTI
                      - generic [ref=e176]:
                        - img [ref=e177]
                        - text: 16 peserta
                    - generic [ref=e182]: Terbatas
  - button "Open Next.js Dev Tools" [ref=e188] [cursor=pointer]:
    - img [ref=e189]
  - alert [ref=e192]
```

# Test source

```ts
  17  |     await page.click('a[href="/dashboard/letters"]');
  18  |     await expect(page).toHaveURL('/dashboard/letters');
  19  |     await expect(page.locator('text=/surat/i')).toBeVisible();
  20  |   });
  21  | 
  22  |   test('should navigate to meetings page', async ({ page }) => {
  23  |     await page.goto('/dashboard');
  24  |     await page.click('a[href="/dashboard/meetings"]');
  25  |     await expect(page).toHaveURL('/dashboard/meetings');
  26  |     await expect(page.locator('text=/rapat/i')).toBeVisible();
  27  |   });
  28  | 
  29  |   test('should navigate to kpi page', async ({ page }) => {
  30  |     await page.goto('/dashboard');
  31  |     await page.click('a[href="/dashboard/kpi"]');
  32  |     await expect(page).toHaveURL('/dashboard/kpi');
  33  |     await expect(page.locator('text=/kpi/i')).toBeVisible();
  34  |   });
  35  | 
  36  |   test('should navigate to finance page', async ({ page }) => {
  37  |     await page.goto('/dashboard');
  38  |     await page.click('a[href="/dashboard/finance"]');
  39  |     await expect(page).toHaveURL('/dashboard/finance');
  40  |     await expect(page.locator('text=/keuangan/i')).toBeVisible();
  41  |   });
  42  | 
  43  |   test('should navigate to members page', async ({ page }) => {
  44  |     await page.goto('/dashboard');
  45  |     await page.click('a[href="/dashboard/members"]');
  46  |     await expect(page).toHaveURL('/dashboard/members');
  47  |     await expect(page.locator('text=/anggota/i')).toBeVisible();
  48  |   });
  49  | 
  50  |   test('should navigate to profile page', async ({ page }) => {
  51  |     await page.goto('/dashboard');
  52  |     await page.click('a[href="/dashboard/profile"]');
  53  |     await expect(page).toHaveURL('/dashboard/profile');
  54  |     await expect(page.locator('text=/profil/i')).toBeVisible();
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
> 117 |     await page.click('[data-testid="meeting-item"]');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
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
  155 |     await page.click('[data-testid="kpi-item"]');
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
```