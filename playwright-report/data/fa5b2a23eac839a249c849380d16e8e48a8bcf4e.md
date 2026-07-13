# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Admin Routes >> should navigate to admin dashboard
- Location: tests\e2e\navigation.spec.ts:179:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/admin/i')
Expected: visible
Error: strict mode violation: locator('text=/admin/i') resolved to 4 elements:
    1) <p class="text-sm font-bold truncate text-on-surface leading-tight">Admin Test</p> aka getByText('Admin Test')
    2) <p class="text-xs font-mono text-on-surface-variant truncate mt-0.5">admin@test.ifest.local</p> aka getByText('admin@test.ifest.local')
    3) <span class="tracking-wide font-sans">ADMIN</span> aka getByRole('link', { name: 'ADMIN' })
    4) <span class="text-on-surface font-bold">ADMIN PANEL</span> aka getByText('ADMIN PANEL')

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=/admin/i')

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
          - generic [ref=e11]: AT
          - generic [ref=e12]:
            - paragraph [ref=e13]: Admin Test
            - paragraph [ref=e14]: admin@test.ifest.local
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
          - link "SURAT" [ref=e31] [cursor=pointer]:
            - /url: /dashboard/letters
            - generic [ref=e32]:
              - img [ref=e33]
              - generic [ref=e36]: SURAT
          - link "RAPAT" [ref=e37] [cursor=pointer]:
            - /url: /dashboard/meetings
            - generic [ref=e38]:
              - img [ref=e39]
              - generic [ref=e41]: RAPAT
          - link "KEUANGAN" [ref=e42] [cursor=pointer]:
            - /url: /dashboard/finance
            - generic [ref=e43]:
              - img [ref=e44]
              - generic [ref=e46]: KEUANGAN
          - link "ANGGOTA" [ref=e47] [cursor=pointer]:
            - /url: /dashboard/members
            - generic [ref=e48]:
              - img [ref=e49]
              - generic [ref=e54]: ANGGOTA
          - link "PROFIL" [ref=e55] [cursor=pointer]:
            - /url: /dashboard/profile
            - generic [ref=e56]:
              - img [ref=e57]
              - generic [ref=e60]: PROFIL
          - link "ADMIN" [ref=e61] [cursor=pointer]:
            - /url: /admin
            - generic [ref=e62]:
              - img [ref=e63]
              - generic [ref=e66]: ADMIN
            - img [ref=e67]
      - generic [ref=e69]:
        - link "BERANDA" [ref=e70] [cursor=pointer]:
          - /url: /
          - img [ref=e71]
          - generic [ref=e74]: BERANDA
        - button "KELUAR" [ref=e75] [cursor=pointer]:
          - img [ref=e76]
          - generic [ref=e79]: KELUAR
    - main [ref=e81]:
      - generic [ref=e82]:
        - generic [ref=e83]:
          - link "DASHBOARD" [ref=e84] [cursor=pointer]:
            - /url: /dashboard
          - generic [ref=e85]: /
          - generic [ref=e86]: ADMIN PANEL
        - generic [ref=e87]:
          - heading "Manajemen Sistem" [level=1] [ref=e88]
          - paragraph [ref=e89]: Kelola struktur organisasi kepanitiaan secara dinamis dan terintegrasi.
        - navigation [ref=e90]:
          - link "Overview" [ref=e91] [cursor=pointer]:
            - /url: /admin
            - img [ref=e92]
            - text: Overview
          - link "Tahun Kepanitiaan" [ref=e95] [cursor=pointer]:
            - /url: /admin/years
            - img [ref=e96]
            - text: Tahun Kepanitiaan
          - link "Divisi" [ref=e98] [cursor=pointer]:
            - /url: /admin/divisions
            - img [ref=e99]
            - text: Divisi
          - link "Role & Jabatan" [ref=e103] [cursor=pointer]:
            - /url: /admin/roles
            - img [ref=e104]
            - text: Role & Jabatan
          - link "Assign Personel" [ref=e106] [cursor=pointer]:
            - /url: /admin/assignments
            - img [ref=e107]
            - text: Assign Personel
          - link "Broadcast Email" [ref=e110] [cursor=pointer]:
            - /url: /admin/broadcast
            - img [ref=e111]
            - text: Broadcast Email
      - generic [ref=e114]:
        - generic [ref=e116]:
          - heading "Dynamic Structure" [level=3] [ref=e117]
          - paragraph [ref=e118]: Divisi dan role disimpan di database — bukan hardcode. Tahun depan, cukup buat tahun kepanitiaan baru dan assign personel baru.
        - generic [ref=e120]:
          - heading "Reset Tahunan" [level=3] [ref=e121]
          - paragraph [ref=e122]:
            - text: Buka menu
            - generic [ref=e123]: Tahun Kepanitiaan
            - text: → buat tahun baru → copy struktur dari tahun sebelumnya. Zero perubahan kode.
  - button "Open Next.js Dev Tools" [ref=e129] [cursor=pointer]:
    - img [ref=e130]
  - alert [ref=e133]
```

# Test source

```ts
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
> 182 |     await expect(page.locator('text=/admin/i')).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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
  256 |     await loginAs(page, 'member');
  257 |     await page.goto('/dashboard/meetings/new');
  258 |     await page.fill('input[name="title"]', 'Test Redirect');
  259 |     await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
  260 |     await page.click('button[type="submit"]');
  261 | 
  262 |     await waitForToast(page, 'Rapat berhasil dibuat');
  263 |     await expect(page).toHaveURL('/dashboard/meetings');
  264 |   });
  265 | 
  266 |   test('should redirect to login after session expires', async ({ page }) => {
  267 |     // Simulate session expiry by clearing session
  268 |     await page.clearCookies();
  269 |     await page.goto('/dashboard');
  270 | 
  271 |     // Should redirect to login
  272 |     await expect(page).toHaveURL('/login');
  273 |   });
  274 | });
  275 | 
  276 | test.describe('Redirect - Protected Routes', () => {
  277 |   test('should redirect unauthenticated users to login', async ({ page }) => {
  278 |     await page.goto('/dashboard');
  279 |     await expect(page).toHaveURL('/login');
  280 |   });
  281 | 
  282 |   test('should redirect to dashboard after login', async ({ page }) => {
```