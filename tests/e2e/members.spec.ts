import { test, expect } from '@playwright/test';
import { loginAs, generateTestEmail, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Member Management
 */

test.describe('Member Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should display members page correctly', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page).toHaveURL('/dashboard/members');
    await expect(page.locator('text=/anggota/i')).toBeVisible();
  });

  test('should show list of members grouped by division', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page.locator('[data-testid="division-group"]')).toBeVisible();
    await expect(page.locator('[data-testid="member-item"]')).toBeVisible();
  });

  test('should navigate to invite member page', async ({ page }) => {
    await page.goto('/dashboard/members');
    await page.click('a[href="/dashboard/members/invite"]');
    await expect(page).toHaveURL('/dashboard/members/invite');
  });

  test('should invite new member successfully', async ({ page }) => {
    await page.goto('/dashboard/members/invite');

    const testEmail = generateTestEmail();

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="fullName"]', 'Test Member New');
    await page.fill('input[name="phone"]', '081234567890');
    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.selectOption('select[name="roleId"]', { index: 1 });

    await page.click('button[type="submit"]');

    await waitForToast(page, 'Undangan terkirim');
    await expect(page).toHaveURL('/dashboard/members');
  });

  test('should show error for duplicate email', async ({ page }) => {
    await page.goto('/dashboard/members/invite');

    // Use existing test account email
    await page.fill('input[name="email"]', TEST_ACCOUNTS.member.email);
    await page.fill('input[name="fullName"]', 'Duplicate User');
    await page.selectOption('select[name="divisionId"]', { index: 1 });
    await page.selectOption('select[name="roleId"]', { index: 1 });

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/sudah terdaftar/i')).toBeVisible();
  });

  test('admin should be able to remove member', async ({ page }) => {
    await page.goto('/dashboard/members');

    // Find a member to remove (not yourself)
    await page.click('[data-testid="member-item"]');
    await page.click('button:has-text("Nonaktifkan")');

    // Confirm removal
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Anggota dinonaktifkan');
  });

  test('should filter members by division', async ({ page }) => {
    await page.goto('/dashboard/members');

    // Click on a division filter
    await page.click('[data-testid="division-filter"]');

    // Should show only members from that division
    await expect(page.locator('[data-testid="member-item"]')).toBeVisible();
  });

  test('should search members by name', async ({ page }) => {
    await page.goto('/dashboard/members');

    await page.fill('input[name="search"]', 'Test');
    await page.press('input[name="search"]', 'Enter');

    await expect(page.locator('[data-testid="member-item"]')).toContainText(/test/i);
  });

  test('member should see own division members', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/members');

    // Should be able to see members page
    await expect(page).toHaveURL('/dashboard/members');
    await expect(page.locator('[data-testid="member-item"]')).toBeVisible();
  });

  test('member should NOT be able to invite new members', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/members');

    // Invite button should not be visible
    const inviteButton = await page.locator('a[href="/dashboard/members/invite"]').count();
    expect(inviteButton).toBe(0);

    // Direct navigation should be blocked
    await page.goto('/dashboard/members/invite');
    await expect(page).not.toHaveURL('/dashboard/members/invite');
  });
});
