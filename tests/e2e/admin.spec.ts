import { test, expect } from '@playwright/test';
import { loginAs, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Admin Management
 *
 * Tests admin-only features: roles, divisions, assignments, committee years
 */

test.describe('Admin Management - Roles', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/roles');
  });

  test('should display roles page correctly', async ({ page }) => {
    await expect(page).toHaveURL('/admin/roles');
    await expect(page.locator('text=/role/i')).toBeVisible();
  });

  test('should list all roles', async ({ page }) => {
    await expect(page.locator('[data-testid="role-item"]')).toBeVisible();
  });

  test('should create new role', async ({ page }) => {
    await page.click('button:has-text("Tambah Role")');

    await page.fill('input[name="name"]', 'Test Role');
    await page.fill('input[name="level"]', '50');
    await page.click('input[name="isApprover"]');

    await page.click('button[type="submit"]');
    await waitForToast(page, 'Role berhasil dibuat');
  });

  test('should edit existing role', async ({ page }) => {
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', 'Updated Role Name');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Role berhasil diupdate');
  });

  test('should delete role', async ({ page }) => {
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Role berhasil dihapus');
  });
});

test.describe('Admin Management - Divisions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/divisions');
  });

  test('should display divisions page correctly', async ({ page }) => {
    await expect(page).toHaveURL('/admin/divisions');
    await expect(page.locator('text=/divisi/i')).toBeVisible();
  });

  test('should list all divisions', async ({ page }) => {
    await expect(page.locator('[data-testid="division-item"]')).toBeVisible();
  });

  test('should create new division', async ({ page }) => {
    await page.click('button:has-text("Tambah Divisi")');

    await page.fill('input[name="name"]', 'Test Division');
    await page.fill('input[name="slug"]', 'test-division');
    await page.fill('input[name="sortOrder"]', '999');

    await page.click('button[type="submit"]');
    await waitForToast(page, 'Divisi berhasil dibuat');
  });

  test('should edit existing division', async ({ page }) => {
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', 'Updated Division Name');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diupdate');
  });

  test('should set WhatsApp group ID for division', async ({ page }) => {
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="whatsappGroupId"]', '120363123456789012@g.us');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diupdate');
  });
});

test.describe('Admin Management - Assignments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/assignments');
  });

  test('should display assignments page correctly', async ({ page }) => {
    await expect(page).toHaveURL('/admin/assignments');
    await expect(page.locator('text=/penugasan/i')).toBeVisible();
  });

  test('should list all assignments', async ({ page }) => {
    await expect(page.locator('[data-testid="assignment-item"]')).toBeVisible();
  });

  test('should filter assignments by division', async ({ page }) => {
    await page.selectOption('select[name="divisionFilter"]', { index: 1 });
    await expect(page.locator('[data-testid="assignment-item"]')).toBeVisible();
  });

  test('should filter assignments by role', async ({ page }) => {
    await page.selectOption('select[name="roleFilter"]', { index: 1 });
    await expect(page.locator('[data-testid="assignment-item"]')).toBeVisible();
  });

  test('should edit assignment (change role)', async ({ page }) => {
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 2 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diupdate');
  });

  test('should deactivate assignment', async ({ page }) => {
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Nonaktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Penugasan dinonaktifkan');
  });
});

test.describe('Admin Management - Committee Years', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/years');
  });

  test('should display years page correctly', async ({ page }) => {
    await expect(page).toHaveURL('/admin/years');
    await expect(page.locator('text=/tahun/i')).toBeVisible();
  });

  test('should list all committee years', async ({ page }) => {
    await expect(page.locator('[data-testid="year-item"]')).toBeVisible();
  });

  test('should create new committee year', async ({ page }) => {
    await page.click('button:has-text("Tambah Tahun")');

    await page.fill('input[name="name"]', '2027');
    await page.fill('input[name="startDate"]', '2027-01-01');
    await page.fill('input[name="endDate"]', '2027-12-31');

    await page.click('button[type="submit"]');
    await waitForToast(page, 'Tahun kepanitiaan berhasil dibuat');
  });

  test('should set active year', async ({ page }) => {
    await page.click('[data-testid="year-item"]');
    await page.click('button:has-text("Set Aktif")');

    await waitForToast(page, 'Tahun aktif diperbarui');
  });
});

test.describe('Admin Access Control', () => {
  test('member should NOT access admin pages', async ({ page }) => {
    await loginAs(page, 'member');

    // Try to access admin pages
    await page.goto('/admin');
    await expect(page).not.toHaveURL('/admin');

    await page.goto('/admin/roles');
    await expect(page).not.toHaveURL('/admin/roles');

    await page.goto('/admin/divisions');
    await expect(page).not.toHaveURL('/admin/divisions');
  });

  test('admin should have access to all admin pages', async ({ page }) => {
    await loginAs(page, 'admin');

    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');

    await page.goto('/admin/roles');
    await expect(page).toHaveURL('/admin/roles');

    await page.goto('/admin/divisions');
    await expect(page).toHaveURL('/admin/divisions');

    await page.goto('/admin/assignments');
    await expect(page).toHaveURL('/admin/assignments');

    await page.goto('/admin/years');
    await expect(page).toHaveURL('/admin/years');
  });
});
