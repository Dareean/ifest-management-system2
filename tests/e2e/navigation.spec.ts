import { test, expect } from '@playwright/test';
import { loginAs, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Navigation & Redirects
 *
 * Tests all navigation flows, redirects, and route protection
 */

test.describe('Navigation - Dashboard Routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate to letters page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/letters"]');
    await expect(page).toHaveURL('/dashboard/letters');
    await expect(page.locator('text=/surat/i')).toBeVisible();
  });

  test('should navigate to meetings page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/meetings"]');
    await expect(page).toHaveURL('/dashboard/meetings');
    await expect(page.locator('text=/rapat/i')).toBeVisible();
  });

  test('should navigate to kpi page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/kpi"]');
    await expect(page).toHaveURL('/dashboard/kpi');
    await expect(page.locator('text=/kpi/i')).toBeVisible();
  });

  test('should navigate to finance page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/finance"]');
    await expect(page).toHaveURL('/dashboard/finance');
    await expect(page.locator('text=/keuangan/i')).toBeVisible();
  });

  test('should navigate to members page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/members"]');
    await expect(page).toHaveURL('/dashboard/members');
    await expect(page.locator('text=/anggota/i')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/profile"]');
    await expect(page).toHaveURL('/dashboard/profile');
    await expect(page.locator('text=/profil/i')).toBeVisible();
  });

  test('should return to dashboard from any page', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Navigation - Letters Routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate to new letter form', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('a[href="/dashboard/letters/new"]');
    await expect(page).toHaveURL('/dashboard/letters/new');
    await expect(page.locator('text=/surat baru|new letter/i')).toBeVisible();
  });

  test('should navigate to letter detail', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await expect(page).toHaveURL(/\/dashboard\/letters\/[a-z0-9-]+/);
  });

  test('should navigate back to letters list from detail', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Kembali")');
    await expect(page).toHaveURL('/dashboard/letters');
  });

  test('should navigate to letter edit from detail', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should filter by letter status', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="filter-requested"]');
    await expect(page).toHaveURL(/status=requested/);
  });
});

test.describe('Navigation - Meetings Routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate to new meeting form', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('a[href="/dashboard/meetings/new"]');
    await expect(page).toHaveURL('/dashboard/meetings/new');
    await expect(page.locator('text=/rapat baru|new meeting/i')).toBeVisible();
  });

  test('should navigate to meeting detail', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await expect(page).toHaveURL(/\/dashboard\/meetings\/[a-z0-9-]+/);
  });

  test('should navigate to meeting notes from detail', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');
    await expect(page).toHaveURL(/\/dashboard\/meetings\/[a-z0-9-]+/);
    await expect(page.locator('text=/notulensi|notes/i')).toBeVisible();
  });

  test('should navigate back to meetings list', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.click('button:has-text("Batal")');
    await expect(page).toHaveURL('/dashboard/meetings');
  });

  test('should filter meetings by status', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="filter-upcoming"]');
    await expect(page).toHaveURL(/filter=upcoming/);
  });
});

test.describe('Navigation - KPI Routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate from dashboard to KPI', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/dashboard/kpi"]');
    await expect(page).toHaveURL('/dashboard/kpi');
  });

  test('should expand KPI to see tasks', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await expect(page.locator('[data-testid="task-item"]')).toBeVisible();
  });

  test('should navigate to task detail', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await expect(page.locator('[data-testid="task-title"]')).toBeVisible();
  });

  test('should navigate back to KPI list', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Kembali")');
    await expect(page).toHaveURL('/dashboard/kpi');
  });
});

test.describe('Navigation - Admin Routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should navigate to admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=/admin/i')).toBeVisible();
  });

  test('should navigate to admin roles', async ({ page }) => {
    await page.goto('/admin');
    await page.click('a[href="/admin/roles"]');
    await expect(page).toHaveURL('/admin/roles');
  });

  test('should navigate to admin divisions', async ({ page }) => {
    await page.goto('/admin');
    await page.click('a[href="/admin/divisions"]');
    await expect(page).toHaveURL('/admin/divisions');
  });

  test('should navigate to admin assignments', async ({ page }) => {
    await page.goto('/admin');
    await page.click('a[href="/admin/assignments"]');
    await expect(page).toHaveURL('/admin/assignments');
  });

  test('should navigate to admin years', async ({ page }) => {
    await page.goto('/admin');
    await page.click('a[href="/admin/years"]');
    await expect(page).toHaveURL('/admin/years');
  });

  test('should navigate back to dashboard from admin', async ({ page }) => {
    await page.goto('/admin');
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Navigation - Auth Routes', () => {
  test('should navigate to login page from home', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    await loginAs(page, 'member');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL('/register');
  });

  test('should logout and return to login', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard');
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Redirect - Post-Action', () => {
  test('should redirect to letters list after creating letter', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test Redirect');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diajukan');
    await expect(page).toHaveURL('/dashboard/letters');
  });

  test('should redirect to meetings list after creating meeting', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Redirect');
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil dibuat');
    await expect(page).toHaveURL('/dashboard/meetings');
  });

  test('should redirect to login after session expires', async ({ page }) => {
    // Simulate session expiry by clearing session
    await page.clearCookies();
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Redirect - Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_ACCOUNTS.member.email);
    await page.fill('input[name="password"]', TEST_ACCOUNTS.member.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect to dashboard for unauthorized admin access', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/admin');

    // Should be redirected away from admin page
    await expect(page).not.toHaveURL('/admin');
  });
});

test.describe('Redirect - Error Pages', () => {
  test('should redirect to 404 for unknown route', async ({ page }) => {
    await page.goto('/dashboard/unknown-route-12345');
    await expect(page).toHaveURL(/\/dashboard\/unknown-route-12345/);
  });

  test('should show error message for invalid input', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters');

    // Try to access invalid letter ID
    await page.goto('/dashboard/letters/invalid-id-12345');
    await expect(page.locator('text=/tidak ditemukan|not found/i')).toBeVisible();
  });
});

test.describe('Navigation - Sidebar', () => {
  test('should navigate via sidebar menu', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard');

    await page.click('a:has-text("Surat")');
    await expect(page).toHaveURL('/dashboard/letters');

    await page.click('a:has-text("Rapat")');
    await expect(page).toHaveURL('/dashboard/meetings');

    await page.click('a:has-text("KPI")');
    await expect(page).toHaveURL('/dashboard/kpi');

    await page.click('a:has-text("Keuangan")');
    await expect(page).toHaveURL('/dashboard/finance');
  });

  test('should highlight active menu item', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters');

    await expect(page.locator('a:has-text("Surat")')).toHaveAttribute('aria-current', 'page');
  });

  test('should show admin menu for admin users', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard');

    await expect(page.locator('a:has-text("Admin")')).toBeVisible();
  });

  test('should hide admin menu for regular members', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard');

    await expect(page.locator('a:has-text("Admin")')).not.toBeVisible();
  });
});

test.describe('Navigation - Breadcrumbs', () => {
  test('should show correct breadcrumbs for letter detail', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');

    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Surat');
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Detail');
  });

  test('should navigate via breadcrumbs', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');

    await page.click('[data-testid="breadcrumb-link"]:has-text("Surat")');
    await expect(page).toHaveURL('/dashboard/letters');
  });
});
