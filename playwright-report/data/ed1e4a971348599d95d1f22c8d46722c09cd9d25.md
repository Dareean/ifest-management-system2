# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation - Meetings Routes >> should navigate to new meeting form
- Location: tests\e2e\navigation.spec.ts:108:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/rapat baru|new meeting/i')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=/rapat baru|new meeting/i')

```

```yaml
- complementary:
  - img "Logo UNTAD"
  - img "Logo HMTI"
  - img "Logo IFEST"
  - text: MT
  - paragraph: Member Test
  - paragraph: member@test.ifest.local
  - navigation:
    - link "OVERVIEW":
      - /url: /dashboard
    - link "KPI":
      - /url: /dashboard/kpi
    - link "RAPAT":
      - /url: /dashboard/meetings
    - link "PROFIL":
      - /url: /dashboard/profile
  - link "BERANDA":
    - /url: /
  - button "KELUAR"
- banner:
  - text: Senin, 13 Juli 2026 • 13.37.02
  - button
- main: Akses ditolak. Role Anda (level 50) tidak mencukupi (min. level 55).
- alert
```

# Test source

```ts
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
> 112 |     await expect(page.locator('text=/rapat baru|new meeting/i')).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
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
```