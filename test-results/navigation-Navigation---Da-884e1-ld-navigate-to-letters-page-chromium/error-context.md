# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Dashboard Routes >> should navigate to letters page
- Location: tests\e2e\navigation.spec.ts:15:7

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('a[href="/dashboard/letters"]')

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
          - generic [ref=e60]: 13.31.35
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
> 17  |     await page.click('a[href="/dashboard/letters"]');
      |                ^ Error: page.click: Test timeout of 45000ms exceeded.
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
  117 |     await page.click('[data-testid="meeting-item"]');
```