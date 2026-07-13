# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Breadcrumbs >> should show correct breadcrumbs for letter detail
- Location: tests\e2e\navigation.spec.ts:357:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('[data-testid="letter-item"]')

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
          - generic [ref=e58]: 13.48.32
        - button [ref=e60]:
          - img [ref=e61]
      - main [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]:
              - paragraph [ref=e68]: Sistem Surat
              - heading "Permohonan Surat" [level=1] [ref=e69]
              - paragraph [ref=e70]: Ajukan dan pantau status permohonan surat Anda.
            - generic [ref=e71]:
              - button "Export CSV" [ref=e72]:
                - img [ref=e73]
                - text: Export CSV
              - link "Ajukan Surat" [ref=e77] [cursor=pointer]:
                - /url: /dashboard/letters/new
                - button "Ajukan Surat" [ref=e78]:
                  - img [ref=e79]
                  - text: Ajukan Surat
          - generic [ref=e80]:
            - generic [ref=e81]:
              - img [ref=e82]
              - heading "Daftar Permohonan" [level=2] [ref=e85]
              - generic [ref=e86]: "4"
            - generic [ref=e87]:
              - generic [ref=e88]:
                - button "Aktif 4" [ref=e89] [cursor=pointer]:
                  - text: Aktif
                  - generic [ref=e90]: "4"
                - button "Selesai" [ref=e91] [cursor=pointer]
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Redirect Member Test EKSTERNAL" [ref=e94] [cursor=pointer]:
                    - /url: /dashboard/letters/733921d5-6917-4324-8ebc-7c613b4c023f
                    - generic [ref=e95]:
                      - generic [ref=e96]:
                        - generic [ref=e97]: Sedang
                        - generic [ref=e98]: Diajukan
                      - generic [ref=e99]: 13 Jul 2026
                    - heading "Test Redirect" [level=3] [ref=e100]
                    - generic [ref=e101]:
                      - generic [ref=e102]:
                        - img [ref=e103]
                        - generic [ref=e106]: Member Test
                      - generic [ref=e107]:
                        - img [ref=e108]
                        - generic [ref=e111]: EKSTERNAL
                  - generic [ref=e112]:
                    - generic [ref=e115]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e116] [cursor=pointer]:
                      - /url: /dashboard/letters/733921d5-6917-4324-8ebc-7c613b4c023f
                      - button "Lihat Status →" [ref=e117]
                - generic [ref=e118]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL not-an-email" [ref=e119] [cursor=pointer]:
                    - /url: /dashboard/letters/388d7e3d-f0f6-493f-8c3e-36deb5aca7ea
                    - generic [ref=e120]:
                      - generic [ref=e121]:
                        - generic [ref=e122]: Sedang
                        - generic [ref=e123]: Diajukan
                      - generic [ref=e124]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e125]
                    - generic [ref=e126]:
                      - generic [ref=e127]:
                        - img [ref=e128]
                        - generic [ref=e131]: Member Test
                      - generic [ref=e132]:
                        - img [ref=e133]
                        - generic [ref=e136]: EKSTERNAL
                      - generic [ref=e137]:
                        - img [ref=e138]
                        - generic [ref=e142]: not-an-email
                  - generic [ref=e143]:
                    - generic [ref=e146]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e147] [cursor=pointer]:
                      - /url: /dashboard/letters/388d7e3d-f0f6-493f-8c3e-36deb5aca7ea
                      - button "Lihat Status →" [ref=e148]
                - generic [ref=e149]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL company@example.com" [ref=e150] [cursor=pointer]:
                    - /url: /dashboard/letters/2f3e5649-732f-47c4-a3bf-7d51889377f6
                    - generic [ref=e151]:
                      - generic [ref=e152]:
                        - generic [ref=e153]: Sedang
                        - generic [ref=e154]: Diajukan
                      - generic [ref=e155]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e156]
                    - generic [ref=e157]:
                      - generic [ref=e158]:
                        - img [ref=e159]
                        - generic [ref=e162]: Member Test
                      - generic [ref=e163]:
                        - img [ref=e164]
                        - generic [ref=e167]: EKSTERNAL
                      - generic [ref=e168]:
                        - img [ref=e169]
                        - generic [ref=e173]: company@example.com
                  - generic [ref=e174]:
                    - generic [ref=e177]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e178] [cursor=pointer]:
                      - /url: /dashboard/letters/2f3e5649-732f-47c4-a3bf-7d51889377f6
                      - button "Lihat Status →" [ref=e179]
                - generic [ref=e180]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL" [ref=e181] [cursor=pointer]:
                    - /url: /dashboard/letters/f0498768-b280-4345-a07a-5df925bf9c54
                    - generic [ref=e182]:
                      - generic [ref=e183]:
                        - generic [ref=e184]: Sedang
                        - generic [ref=e185]: Diajukan
                      - generic [ref=e186]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e187]
                    - generic [ref=e188]:
                      - generic [ref=e189]:
                        - img [ref=e190]
                        - generic [ref=e193]: Member Test
                      - generic [ref=e194]:
                        - img [ref=e195]
                        - generic [ref=e198]: EKSTERNAL
                  - generic [ref=e199]:
                    - generic [ref=e202]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e203] [cursor=pointer]:
                      - /url: /dashboard/letters/f0498768-b280-4345-a07a-5df925bf9c54
                      - button "Lihat Status →" [ref=e204]
  - button "Open Next.js Dev Tools" [ref=e210] [cursor=pointer]:
    - img [ref=e211]
  - alert [ref=e214]
```

# Test source

```ts
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
  352 |     await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  353 |   });
  354 | });
  355 | 
  356 | test.describe('Navigation - Breadcrumbs', () => {
  357 |   test('should show correct breadcrumbs for letter detail', async ({ page }) => {
  358 |     await loginAs(page, 'member');
  359 |     await page.goto('/dashboard/letters');
> 360 |     await page.click('[data-testid="letter-item"]');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
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