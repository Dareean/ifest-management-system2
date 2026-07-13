import { test, expect } from '@playwright/test';
import { loginAs, logout, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Authentication
 *
 * Tests login, logout, and access control for different user roles
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from login page
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title and form elements
    await expect(page).toHaveTitle(/login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully as admin', async ({ page }) => {
    const admin = TEST_ACCOUNTS.admin;

    // Fill login form
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Should display user name or welcome message
    await expect(page.locator(`text=${admin.name}`)).toBeVisible();
  });

  test('should login successfully as sekretaris', async ({ page }) => {
    const sekretaris = TEST_ACCOUNTS.sekretaris;

    await page.fill('input[name="email"]', sekretaris.email);
    await page.fill('input[name="password"]', sekretaris.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=${sekretaris.name}`)).toBeVisible();
  });

  test('should login successfully as member', async ({ page }) => {
    const member = TEST_ACCOUNTS.member;

    await page.fill('input[name="email"]', member.email);
    await page.fill('input[name="password"]', member.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=${member.name}`)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@test.ifest.local');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();

    // Should remain on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginAs(page, 'member');

    // Logout
    await logout(page);

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('admin should access admin routes', async ({ page }) => {
    await loginAs(page, 'admin');

    // Navigate to admin page
    await page.goto('/admin');

    // Should be able to access
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text="ADMIN PANEL"').first()).toBeVisible();
  });

  test('member should NOT access admin routes', async ({ page }) => {
    await loginAs(page, 'member');

    // Try to access admin page
    await page.goto('/admin');

    // Should be redirected or show error
    await expect(page).not.toHaveURL('/admin');
  });
});
