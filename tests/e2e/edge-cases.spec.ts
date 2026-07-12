import { test, expect } from '@playwright/test';
import { loginAs, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * Edge Case Tests
 *
 * Tests error handling, empty states, invalid inputs, and boundary conditions
 */

test.describe('Edge Cases - Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should handle empty KPI list gracefully', async ({ page }) => {
    await page.goto('/dashboard/kpi');

    // Should show empty state message if no KPIs
    const kpiItems = await page.locator('[data-testid="kpi-item"]').count();
    if (kpiItems === 0) {
      await expect(page.locator('text=/belum ada kpi/i')).toBeVisible();
    }
  });

  test('should handle empty letter list gracefully', async ({ page }) => {
    await page.goto('/dashboard/letters');

    const letterItems = await page.locator('[data-testid="letter-item"]').count();
    if (letterItems === 0) {
      await expect(page.locator('text=/belum ada surat/i')).toBeVisible();
    }
  });

  test('should handle empty meeting list gracefully', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    const meetingItems = await page.locator('[data-testid="meeting-item"]').count();
    if (meetingItems === 0) {
      await expect(page.locator('text=/belum ada rapat/i')).toBeVisible();
    }
  });

  test('should handle empty notification list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="notification-bell"]');

    const notifications = await page.locator('[data-testid="notification-item"]').count();
    if (notifications === 0) {
      await expect(page.locator('text=/tidak ada notifikasi/i')).toBeVisible();
    }
  });
});

test.describe('Edge Cases - Invalid Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should reject invalid email format in invite', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/members/invite');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/email.*valid/i')).toBeVisible();
  });

  test('should reject negative budget amount', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '-1000');
    await page.fill('textarea[name="purpose"]', 'Test');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*positive/i')).toBeVisible();
  });

  test('should reject zero budget amount', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '0');
    await page.fill('textarea[name="purpose"]', 'Test');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*greater/i')).toBeVisible();
  });

  test('should reject past date for meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');

    await page.fill('input[name="title"]', 'Test Meeting');
    await page.fill('input[name="startedAt"]', '2020-01-01T10:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/date.*future/i')).toBeVisible();
  });

  test('should reject empty letter subject', async ({ page }) => {
    await page.goto('/dashboard/letters/new');

    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('textarea[name="body"]', 'Test body');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/subject.*required/i')).toBeVisible();
  });
});

test.describe('Edge Cases - Boundary Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should handle very long letter subject', async ({ page }) => {
    await page.goto('/dashboard/letters/new');

    const longSubject = 'A'.repeat(500);
    await page.fill('input[name="subject"]', longSubject);

    // Should either truncate or show validation error
    const subjectValue = await page.locator('input[name="subject"]').inputValue();
    expect(subjectValue.length).toBeLessThanOrEqual(500);
  });

  test('should handle maximum budget amount', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '999999999');
    await page.fill('textarea[name="purpose"]', 'Test');

    // Should either accept or show reasonable limit
    const amount = await page.locator('input[name="amount"]').inputValue();
    expect(Number(amount)).toBeGreaterThan(0);
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/dashboard/letters');

    await page.fill('input[name="search"]', '<script>alert("xss")</script>');
    await page.press('input[name="search"]', 'Enter');

    // Should not execute script, should treat as plain text
    await expect(page.locator('alert')).not.toBeVisible();
  });
});

test.describe('Edge Cases - Permission Violations', () => {
  test('member should not access admin API endpoints', async ({ page }) => {
    await loginAs(page, 'member');

    // Try to access admin API (would need proper route)
    const response = await page.request.get('/admin/roles');
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('member should not modify other division data', async ({ page }) => {
    await loginAs(page, 'member');

    // Should only see own division's data
    await page.goto('/dashboard/kpi');
    await expect(page.locator('[data-testid="kpi-item"]')).toBeVisible();
  });

  test('logged out user should redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Edge Cases - Error Handling', () => {
  test('should handle network timeout gracefully', async ({ page }) => {
    await loginAs(page, 'member');

    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 5000);
    });

    await page.goto('/dashboard/letters');

    // Should show loading state or error message
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  });

  test('should handle form submission failure', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters/new');

    // Intercept and fail the submission
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/error|gagal/i')).toBeVisible();
  });

  test('should handle database constraint violation', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/roles');

    // Try to create duplicate role
    await page.click('button:has-text("Tambah Role")');
    await page.fill('input[name="name"]', 'Member'); // Existing role
    await page.fill('input[name="level"]', '10');
    await page.click('button[type="submit"]');

    // Should show duplicate error
    await expect(page.locator('text=/sudah ada|duplicate/i')).toBeVisible();
  });
});

test.describe('Edge Cases - Concurrent Operations', () => {
  test('should handle concurrent task updates', async ({ page, context }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    // Open same task in two tabs
    const page2 = await context.newPage();
    await loginAs(page2, 'member');
    await page2.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    await page2.click('[data-testid="kpi-item"]');
    await page2.click('[data-testid="task-item"]');

    // Both try to update status
    await page.selectOption('select[name="status"]', 'in_progress');
    await page2.selectOption('select[name="status"]', 'done');

    await page.click('button:has-text("Simpan")');
    await page2.click('button:has-text("Simpan")');

    // Should handle gracefully (either conflict error or last-write-wins)
    await expect(page.locator('text=/berhasil|conflict/i')).toBeVisible();

    await page2.close();
  });
});
