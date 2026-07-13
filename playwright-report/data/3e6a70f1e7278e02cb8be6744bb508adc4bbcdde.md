# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Redirect - Post-Action >> should redirect to letters list after creating letter
- Location: tests\e2e\navigation.spec.ts:243:7

# Error details

```
ReferenceError: waitForToast is not defined
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
          - link "PROFIL" [ref=e36] [cursor=pointer]:
            - /url: /dashboard/profile
            - generic [ref=e37]:
              - img [ref=e38]
              - generic [ref=e41]: PROFIL
      - generic [ref=e42]:
        - link "BERANDA" [ref=e43] [cursor=pointer]:
          - /url: /
          - img [ref=e44]
          - generic [ref=e47]: BERANDA
        - button "KELUAR" [ref=e48] [cursor=pointer]:
          - img [ref=e49]
          - generic [ref=e52]: KELUAR
    - generic [ref=e53]:
      - banner [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: Senin, 13 Juli 2026
          - generic [ref=e57]: •
          - generic [ref=e58]: 13.44.31
        - button [ref=e60]:
          - img [ref=e61]
      - main [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - paragraph [ref=e67]: Sistem Surat
            - heading "Ajukan Permohonan Surat" [level=1] [ref=e68]
            - paragraph [ref=e69]: Isi formulir di bawah ini untuk mengajukan permohonan surat baru.
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: Nama Surat *
              - 'textbox "Contoh: Permohonan Sponsor Bank Indonesia" [ref=e74]': Test Redirect
            - generic [ref=e75]:
              - generic [ref=e76]:
                - generic [ref=e77]: Deadline Dibutuhkan
                - textbox [ref=e78]
              - generic [ref=e79]:
                - generic [ref=e80]: Instansi Tujuan
                - 'textbox "Contoh: Bank Indonesia, Dekanat FT" [ref=e81]'
            - generic [ref=e82]:
              - generic [ref=e83]:
                - generic [ref=e84]: Jenis Surat *
                - combobox [ref=e85] [cursor=pointer]:
                  - option "Pilih jenis surat"
                  - option "Eksternal" [selected]
                  - option "Internal"
              - generic [ref=e86]:
                - generic [ref=e87]: Kategori Surat
                - combobox [ref=e88] [cursor=pointer]:
                  - option "Pilih kategori" [selected]
                  - option "Pengantar"
                  - option "Rekomendasi"
                  - option "Peminjaman"
                  - option "Undangan"
                  - option "Permohonan"
                  - option "Legalitas"
            - generic [ref=e89]:
              - generic [ref=e90]: Prioritas
              - generic [ref=e91]:
                - generic [ref=e92] [cursor=pointer]:
                  - radio "tinggi" [ref=e93]
                  - generic [ref=e94]: tinggi
                - generic [ref=e95] [cursor=pointer]:
                  - radio "sedang" [checked] [ref=e96]
                  - generic [ref=e97]: sedang
                - generic [ref=e98] [cursor=pointer]:
                  - radio "rendah" [ref=e99]
                  - generic [ref=e100]: rendah
            - generic [ref=e101]:
              - generic [ref=e102]: Maksud Surat *
              - textbox "Tulis maksud dan tujuan surat di sini..." [ref=e103]: Test body
            - generic [ref=e104]:
              - generic [ref=e105]: Permintaan Opsi Surat (opsional)
              - 'textbox "Contoh: Surat mohon dilengkapi kop HMTI, 2 rangkap, lampiran proposal" [ref=e106]'
            - generic [ref=e107]:
              - button "Batal" [ref=e108] [cursor=pointer]
              - button "Mengirim..." [disabled]
  - button "Open Next.js Dev Tools" [ref=e114] [cursor=pointer]:
    - img [ref=e115]
  - alert [ref=e118]
```

# Test source

```ts
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
> 251 |     await waitForToast(page, 'Surat berhasil diajukan');
      |     ^ ReferenceError: waitForToast is not defined
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
  283 |     await page.goto('/login');
  284 |     await page.fill('input[name="email"]', TEST_ACCOUNTS.member.email);
  285 |     await page.fill('input[name="password"]', TEST_ACCOUNTS.member.password);
  286 |     await page.click('button[type="submit"]');
  287 | 
  288 |     await expect(page).toHaveURL('/dashboard');
  289 |   });
  290 | 
  291 |   test('should redirect to dashboard for unauthorized admin access', async ({ page }) => {
  292 |     await loginAs(page, 'member');
  293 |     await page.goto('/admin');
  294 | 
  295 |     // Should be redirected away from admin page
  296 |     await expect(page).not.toHaveURL('/admin');
  297 |   });
  298 | });
  299 | 
  300 | test.describe('Redirect - Error Pages', () => {
  301 |   test('should redirect to 404 for unknown route', async ({ page }) => {
  302 |     await page.goto('/dashboard/unknown-route-12345');
  303 |     await expect(page).toHaveURL(/\/dashboard\/unknown-route-12345/);
  304 |   });
  305 | 
  306 |   test('should show error message for invalid input', async ({ page }) => {
  307 |     await loginAs(page, 'member');
  308 |     await page.goto('/dashboard/letters');
  309 | 
  310 |     // Try to access invalid letter ID
  311 |     await page.goto('/dashboard/letters/invalid-id-12345');
  312 |     await expect(page.locator('text=/tidak ditemukan|not found/i')).toBeVisible();
  313 |   });
  314 | });
  315 | 
  316 | test.describe('Navigation - Sidebar', () => {
  317 |   test('should navigate via sidebar menu', async ({ page }) => {
  318 |     await loginAs(page, 'member');
  319 |     await page.goto('/dashboard');
  320 | 
  321 |     await page.click('a:has-text("Surat")');
  322 |     await expect(page).toHaveURL('/dashboard/letters');
  323 | 
  324 |     await page.click('a:has-text("Rapat")');
  325 |     await expect(page).toHaveURL('/dashboard/meetings');
  326 | 
  327 |     await page.click('a:has-text("KPI")');
  328 |     await expect(page).toHaveURL('/dashboard/kpi');
  329 | 
  330 |     await page.click('a:has-text("Keuangan")');
  331 |     await expect(page).toHaveURL('/dashboard/finance');
  332 |   });
  333 | 
  334 |   test('should highlight active menu item', async ({ page }) => {
  335 |     await loginAs(page, 'member');
  336 |     await page.goto('/dashboard/letters');
  337 | 
  338 |     await expect(page.locator('a:has-text("Surat")')).toHaveAttribute('aria-current', 'page');
  339 |   });
  340 | 
  341 |   test('should show admin menu for admin users', async ({ page }) => {
  342 |     await loginAs(page, 'admin');
  343 |     await page.goto('/dashboard');
  344 | 
  345 |     await expect(page.locator('a:has-text("Admin")')).toBeVisible();
  346 |   });
  347 | 
  348 |   test('should hide admin menu for regular members', async ({ page }) => {
  349 |     await loginAs(page, 'member');
  350 |     await page.goto('/dashboard');
  351 | 
```