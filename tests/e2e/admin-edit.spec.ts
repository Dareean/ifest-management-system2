import { test, expect } from '@playwright/test';
import { loginAs, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Admin EDIT Operations
 *
 * Tests editing roles, divisions, and assignments
 */

test.describe('Admin Edit - Roles', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should edit role name', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', 'Updated Role Name');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Role berhasil diperbarui');
    await expect(page.locator('text=/Updated Role Name/i')).toBeVisible();
  });

  test('should edit role level', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="level"]', '85');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Role berhasil diperbarui');
  });

  test('should toggle approver status', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.click('input[name="isApprover"]');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Role berhasil diperbarui');
  });

  test('should cancel role edit', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', 'Changed but will cancel');
    await page.click('button:has-text("Batal")');

    await expect(page.locator('text=/Changed but will cancel/i')).not.toBeVisible();
  });
});

test.describe('Admin Edit - Divisions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should edit division name', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', 'Updated Division Name');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diperbarui');
    await expect(page.locator('text=/Updated Division Name/i')).toBeVisible();
  });

  test('should edit division slug', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="slug"]', 'updated-division-slug');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diperbarui');
  });

  test('should update division sort order', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="sortOrder"]', '999');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diperbarui');
  });

  test('should edit WhatsApp group ID', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="whatsappGroupId"]', '120363123456789012@g.us');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diperbarui');
  });

  test('should clear WhatsApp group ID', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="whatsappGroupId"]', '');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Divisi berhasil diperbarui');
  });
});

test.describe('Admin Edit - Assignments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should change assignment role', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 2 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('should change assignment division', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('should update assignment status to inactive', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Nonaktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Penugasan dinonaktifkan');
  });

  test('should reactivate assignment', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.click('[data-testid="assignment-item"]:has([data-testid="inactive-badge"])');
    await page.click('button:has-text("Aktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Penugasan diaktifkan');
  });

  test('should cancel assignment edit', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.click('[data-testid="assignment-item"]');
    await page.click('button:has-text("Edit")');

    const initialRole = await page.locator('select[name="roleId"]').inputValue();
    await page.selectOption('select[name="roleId"]', { index: 0 });
    await page.click('button:has-text("Batal")');

    const currentRole = await page.locator('select[name="roleId"]').inputValue();
    expect(currentRole).toBe(initialRole);
  });
});

test.describe('Admin Edit - Committee Years', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should edit committee year name', async ({ page }) => {
    await page.goto('/admin/years');
    await page.click('[data-testid="year-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', '2027 Updated');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tahun kepanitiaan berhasil diperbarui');
    await expect(page.locator('text=/2027 Updated/i')).toBeVisible();
  });

  test('should edit committee year dates', async ({ page }) => {
    await page.goto('/admin/years');
    await page.click('[data-testid="year-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="startDate"]', '2027-01-01');
    await page.fill('input[name="endDate"]', '2027-12-31');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tahun kepanitiaan berhasil diperbarui');
  });

  test('should set committee year as active', async ({ page }) => {
    await page.goto('/admin/years');
    await page.click('[data-testid="year-item"]');
    await page.click('button:has-text("Set Aktif")');

    await waitForToast(page, 'Tahun aktif diperbarui');
  });
});

test.describe('Admin Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should prevent empty role name', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="name"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/name.*wajib|required/i')).toBeVisible();
  });

  test('should prevent duplicate slug', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="slug"]', 'bph');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/slug.*sudah|duplicate/i')).toBeVisible();
  });

  test('should prevent negative sort order', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="sortOrder"]', '-1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/sort.*positive|urutan.*positif/i')).toBeVisible();
  });

  test('should require start date before end date', async ({ page }) => {
    await page.goto('/admin/years');
    await page.click('[data-testid="year-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="startDate"]', '2027-12-31');
    await page.fill('input[name="endDate"]', '2027-01-01');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/start.*before.*end|awal.*sebelum/i')).toBeVisible();
  });
});

test.describe('Admin Edit - Permissions', () => {
  test('member should NOT access admin edit', async ({ page }) => {
    await loginAs(page, 'member');

    await page.goto('/admin/roles');
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });

  test('sekretaris should NOT edit roles', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/admin/roles');

    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });
});
