import { test, expect } from '@playwright/test';
import { loginAs, generateTestEmail, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Members EDIT Operations
 *
 * Tests editing member assignments and roles
 */

test.describe('Members Edit - Role Changes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should change member role', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 2 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('should change member division', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('should change member to higher role level', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    // Select a role with higher level (if available)
    const roleOptions = await page.locator('select[name="roleId"] option').count();
    if (roleOptions > 1) {
      await page.selectOption('select[name="roleId"]', { index: roleOptions - 1 });
      await page.click('button[type="submit"]');

      await waitForToast(page, 'Penugasan berhasil diperbarui');
    }
  });

  test('should change member to lower role level', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]:has-text("Ketua")');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('should cancel member role edit', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    const initialRole = await page.locator('select[name="roleId"]').inputValue();
    await page.selectOption('select[name="roleId"]', { index: 0 });
    await page.click('button:has-text("Batal")');

    // Should revert to original
    const currentRole = await page.locator('select[name="roleId"]').inputValue();
    expect(currentRole).toBe(initialRole);
  });
});

test.describe('Members Edit - Division Transfers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should transfer member to different division', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Pindah Divisi")');

    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Anggota berhasil dipindahkan');
  });

  test('should update member statistics after transfer', async ({ page }) => {
    await page.goto('/dashboard/members');

    const initialStats = await page.locator('[data-testid="division-stat"]').allTextContents();

    // Transfer a member
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Pindah Divisi")');
    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Anggota berhasil dipindahkan');
    await page.goto('/dashboard/members');

    const newStats = await page.locator('[data-testid="division-stat"]').allTextContents();
    expect(newStats).not.toEqual(initialStats);
  });

  test('should keep role when transferring division', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');

    const roleBeforeTransfer = await page.locator('[data-testid="member-role"]').textContent();

    await page.click('button:has-text("Pindah Divisi")');
    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Anggota berhasil dipindahkan');
    await page.goto('/dashboard/members');

    const roleAfterTransfer = await page.locator('[data-testid="member-role"]').textContent();
    expect(roleAfterTransfer).toBe(roleBeforeTransfer);
  });
});

test.describe('Members Edit - Permissions', () => {
  test('member should NOT edit other members', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/members');

    await page.click('[data-testid="member-item"]');

    // Edit button should not appear for regular members
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });

  test('sekretaris should be able to edit members', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/members');

    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });

  test('admin should edit any member', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/members');

    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="roleId"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Penugasan berhasil diperbarui');
  });
});

test.describe('Members Edit - Deactivation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should deactivate active member', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]:not(:has([data-testid="inactive-badge"]))');

    await page.click('button:has-text("Nonaktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Anggota dinonaktifkan');
  });

  test('should reactivate inactive member', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]:has([data-testid="inactive-badge"])');

    await page.click('button:has-text("Aktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Anggota diaktifkan');
  });

  test('deactivated member should not appear in active lists', async ({ page }) => {
    await page.goto('/dashboard/members');

    // Get count of active members
    const initialCount = await page.locator('[data-testid="member-item"]:not(:has([data-testid="inactive-badge"]))').count();

    // Deactivate a member
    await page.click('[data-testid="member-item"]:not(:has([data-testid="inactive-badge"]))');
    await page.click('button:has-text("Nonaktifkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Anggota dinonaktifkan');
    await page.goto('/dashboard/members');

    // Should have one less active member
    const newCount = await page.locator('[data-testid="member-item"]:not(:has([data-testid="inactive-badge"]))').count();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('Members Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should prevent removing all admin members', async ({ page }) => {
    await page.goto('/dashboard/members');

    // Try to change the last admin to a lower role
    const adminMembers = await page.locator('[data-testid="member-item"]:has-text("Admin")').count();

    if (adminMembers === 1) {
      await page.click('[data-testid="member-item"]:has-text("Admin")');
      await page.click('button:has-text("Edit")');
      await page.selectOption('select[name="roleId"]', { index: 0 });
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/must.*one.*admin|minimal.*admin/i')).toBeVisible();
    }
  });

  test('should require division selection', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Pindah Divisi")');

    // Try to submit without selecting division
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/division.*required|divisi.*wajib/i')).toBeVisible();
  });
});
