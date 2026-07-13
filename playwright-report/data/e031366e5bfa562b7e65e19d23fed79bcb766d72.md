# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Sidebar >> should navigate via sidebar menu
- Location: tests\e2e\navigation.spec.ts:317:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('a:has-text("Surat")')

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
            - img [ref=e24]
          - link "KPI" [ref=e26] [cursor=pointer]:
            - /url: /dashboard/kpi
            - generic [ref=e27]:
              - img [ref=e28]
              - generic [ref=e32]: KPI
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
          - generic [ref=e60]: 13.47.12
        - button [ref=e62]:
          - img [ref=e63]
      - main [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]:
            - paragraph [ref=e69]: DASHBOARD ACARA
            - heading "Halo, Member!" [level=1] [ref=e70]
            - paragraph [ref=e71]: Pantau task dan undangan rapat Anda di sini.
          - generic [ref=e72]:
            - generic [ref=e73]:
              - paragraph [ref=e74]: TOTAL TASK
              - paragraph [ref=e75]: "0"
              - paragraph [ref=e76]: Tugas Anda
            - generic [ref=e77]:
              - paragraph [ref=e78]: TASK SELESAI
              - paragraph [ref=e79]: 0 / 0
              - paragraph [ref=e80]: Pekerjaan rampung
            - generic [ref=e81]:
              - paragraph [ref=e82]: RAPAT BARU
              - paragraph [ref=e83]: "0"
              - paragraph [ref=e84]: Belum direspon
          - generic [ref=e85]:
            - generic [ref=e86]:
              - generic [ref=e87]:
                - img [ref=e88]
                - heading "Tugas Terbaru" [level=2] [ref=e91]
              - paragraph [ref=e94]: Belum ada task.
            - generic [ref=e95]:
              - generic [ref=e96]:
                - img [ref=e97]
                - heading "Undangan Rapat" [level=2] [ref=e99]
              - paragraph [ref=e101]: Belum ada undangan rapat.
  - button "Open Next.js Dev Tools" [ref=e107] [cursor=pointer]:
    - img [ref=e108]
  - alert [ref=e111]
```

# Test source

```ts
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
> 321 |     await page.click('a:has-text("Surat")');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
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
  352 |     await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  353 |   });
  354 | });
  355 | 
  356 | test.describe('Navigation - Breadcrumbs', () => {
  357 |   test('should show correct breadcrumbs for letter detail', async ({ page }) => {
  358 |     await loginAs(page, 'member');
  359 |     await page.goto('/dashboard/letters');
  360 |     await page.click('[data-testid="letter-item"]');
  361 | 
  362 |     await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Surat');
  363 |     await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Detail');
  364 |   });
  365 | 
  366 |   test('should navigate via breadcrumbs', async ({ page }) => {
  367 |     await loginAs(page, 'member');
  368 |     await page.goto('/dashboard/letters');
  369 |     await page.click('[data-testid="letter-item"]');
  370 | 
  371 |     await page.click('[data-testid="breadcrumb-link"]:has-text("Surat")');
  372 |     await expect(page).toHaveURL('/dashboard/letters');
  373 |   });
  374 | });
  375 | 
```