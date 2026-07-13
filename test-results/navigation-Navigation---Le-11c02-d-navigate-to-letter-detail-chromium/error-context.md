# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Letters Routes >> should navigate to letter detail
- Location: tests\e2e\navigation.spec.ts:76:7

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
          - generic [ref=e58]: 13.34.20
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
              - generic [ref=e86]: "3"
            - generic [ref=e87]:
              - generic [ref=e88]:
                - button "Aktif 3" [ref=e89] [cursor=pointer]:
                  - text: Aktif
                  - generic [ref=e90]: "3"
                - button "Selesai" [ref=e91] [cursor=pointer]
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL not-an-email" [ref=e94] [cursor=pointer]:
                    - /url: /dashboard/letters/388d7e3d-f0f6-493f-8c3e-36deb5aca7ea
                    - generic [ref=e95]:
                      - generic [ref=e96]:
                        - generic [ref=e97]: Sedang
                        - generic [ref=e98]: Diajukan
                      - generic [ref=e99]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e100]
                    - generic [ref=e101]:
                      - generic [ref=e102]:
                        - img [ref=e103]
                        - generic [ref=e106]: Member Test
                      - generic [ref=e107]:
                        - img [ref=e108]
                        - generic [ref=e111]: EKSTERNAL
                      - generic [ref=e112]:
                        - img [ref=e113]
                        - generic [ref=e117]: not-an-email
                  - generic [ref=e118]:
                    - generic [ref=e121]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e122] [cursor=pointer]:
                      - /url: /dashboard/letters/388d7e3d-f0f6-493f-8c3e-36deb5aca7ea
                      - button "Lihat Status →" [ref=e123]
                - generic [ref=e124]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL company@example.com" [ref=e125] [cursor=pointer]:
                    - /url: /dashboard/letters/2f3e5649-732f-47c4-a3bf-7d51889377f6
                    - generic [ref=e126]:
                      - generic [ref=e127]:
                        - generic [ref=e128]: Sedang
                        - generic [ref=e129]: Diajukan
                      - generic [ref=e130]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e131]
                    - generic [ref=e132]:
                      - generic [ref=e133]:
                        - img [ref=e134]
                        - generic [ref=e137]: Member Test
                      - generic [ref=e138]:
                        - img [ref=e139]
                        - generic [ref=e142]: EKSTERNAL
                      - generic [ref=e143]:
                        - img [ref=e144]
                        - generic [ref=e148]: company@example.com
                  - generic [ref=e149]:
                    - generic [ref=e152]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e153] [cursor=pointer]:
                      - /url: /dashboard/letters/2f3e5649-732f-47c4-a3bf-7d51889377f6
                      - button "Lihat Status →" [ref=e154]
                - generic [ref=e155]:
                  - link "Sedang Diajukan 13 Jul 2026 Test Member Test EKSTERNAL" [ref=e156] [cursor=pointer]:
                    - /url: /dashboard/letters/f0498768-b280-4345-a07a-5df925bf9c54
                    - generic [ref=e157]:
                      - generic [ref=e158]:
                        - generic [ref=e159]: Sedang
                        - generic [ref=e160]: Diajukan
                      - generic [ref=e161]: 13 Jul 2026
                    - heading "Test" [level=3] [ref=e162]
                    - generic [ref=e163]:
                      - generic [ref=e164]:
                        - img [ref=e165]
                        - generic [ref=e168]: Member Test
                      - generic [ref=e169]:
                        - img [ref=e170]
                        - generic [ref=e173]: EKSTERNAL
                  - generic [ref=e174]:
                    - generic [ref=e177]: Menunggu diproses sekretaris
                    - link "Lihat Status →" [ref=e178] [cursor=pointer]:
                      - /url: /dashboard/letters/f0498768-b280-4345-a07a-5df925bf9c54
                      - button "Lihat Status →" [ref=e179]
  - button "Open Next.js Dev Tools" [ref=e185] [cursor=pointer]:
    - img [ref=e186]
  - alert [ref=e189]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { loginAs, TEST_ACCOUNTS } from '../utils/test-helpers';
  3   | 
  4   | /**
  5   |  * E2E Tests for Navigation & Redirects
  6   |  *
  7   |  * Tests all navigation flows, redirects, and route protection
  8   |  */
  9   | 
  10  | test.describe('Navigation - Dashboard Routes', () => {
  11  |   test.beforeEach(async ({ page }) => {
  12  |     await loginAs(page, 'member');
  13  |   });
  14  | 
  15  |   test('should navigate to letters page', async ({ page }) => {
  16  |     await page.goto('/dashboard');
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
> 78  |     await page.click('[data-testid="letter-item"]');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
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
```