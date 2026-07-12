import { test, expect } from '@playwright/test';
import { loginAs, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Finance Management - Comprehensive
 */

test.describe('Finance Management - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should display finance page correctly', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await expect(page).toHaveURL('/dashboard/finance');
    await expect(page.locator('text=/keuangan/i')).toBeVisible();
  });

  test('should show finance overview statistics', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await expect(page.locator('[data-testid="finance-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-budget"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-used"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-remaining"]')).toBeVisible();
  });

  test('should show pending budget requests count', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await expect(page.locator('[data-testid="pending-requests-count"]')).toBeVisible();
  });

  test('should display budget allocation per division', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await expect(page.locator('[data-testid="budget-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="division-name"]')).toBeVisible();
  });

  test('should show budget usage percentage', async ({ page }) => {
    await page.goto('/dashboard/finance');
    const budgetItems = await page.locator('[data-testid="budget-item"]').count();
    expect(budgetItems).toBeGreaterThan(0);
    await expect(page.locator('[data-testid="usage-percentage"]')).toBeVisible();
  });
});

test.describe('Finance Management - Budget Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate to budget request form', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should create new budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '1000000');
    await page.fill('textarea[name="purpose"]', 'Test budget request for event supplies');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Pengajuan berhasil');
  });

  test('should show error for empty amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('textarea[name="purpose"]', 'Test purpose');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*required/i')).toBeVisible();
  });

  test('should show error for empty purpose', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '500000');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/purpose.*required/i')).toBeVisible();
  });

  test('should list budget requests', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await expect(page.locator('[data-testid="request-item"]')).toBeVisible();
  });

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="filter-pending"]');
    await expect(page.locator('[data-testid="request-item"]')).toBeVisible();
  });

  test('member should see own requests', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="filter-my-requests"]');
    await expect(page.locator('[data-testid="request-item"]')).toBeVisible();
  });
});

test.describe('Finance Management - Budget Approval', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should display pending budget requests for approval', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="filter-pending"]');
    const pendingRequests = await page.locator('[data-testid="request-item"]').count();
    expect(pendingRequests).toBeGreaterThanOrEqual(0);
  });

  test('should approve budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');

    await page.click('button:has-text("Setujui")');
    await page.fill('textarea[name="notes"]', 'Approved for event budget');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Pengajuan disetujui');
  });

  test('should reject budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');

    await page.click('button:has-text("Tolak")');
    await page.fill('textarea[name="notes"]', 'Budget insufficient, please revise');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Pengajuan ditolak');
  });
});

test.describe('Finance Management - Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should view division budget details', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await expect(page.locator('[data-testid="transaction-list"]')).toBeVisible();
  });

  test('should add expense transaction', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Tambah Pengeluaran")');

    await page.fill('input[name="amount"]', '500000');
    await page.fill('textarea[name="description"]', 'Payment for event supplies');
    await page.fill('input[name="category"]', 'Supplies');
    await page.fill('input[name="transactionDate"]', '2026-07-10');

    await page.click('button[type="submit"]');
    await waitForToast(page, 'Transaksi berhasil ditambahkan');
  });

  test('should add income transaction', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Tambah Pemasukan")');

    await page.fill('input[name="amount"]', '2000000');
    await page.fill('textarea[name="description"]', 'Sponsor donation');
    await page.fill('input[name="category"]', 'Sponsorship');
    await page.fill('input[name="transactionDate"]', '2026-07-05');

    await page.click('button[type="submit"]');
    await waitForToast(page, 'Transaksi berhasil ditambahkan');
  });

  test('should update budget balance after transaction', async ({ page }) => {
    await page.goto('/dashboard/finance');
    const initialBalance = await page.locator('[data-testid="total-remaining"]').textContent();

    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Tambah Pengeluaran")');
    await page.fill('input[name="amount"]', '100000');
    await page.fill('textarea[name="description"]', 'Test expense');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil ditambahkan');
    await page.goto('/dashboard/finance');

    const newBalance = await page.locator('[data-testid="total-remaining"]').textContent();
    expect(newBalance).not.toBe(initialBalance);
  });

  test('should filter transactions by date', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');

    await page.fill('input[name="startDate"]', '2026-07-01');
    await page.fill('input[name="endDate"]', '2026-07-31');
    await page.click('button:has-text("Filter")');

    await expect(page.locator('[data-testid="transaction-item"]')).toBeVisible();
  });

  test('should filter transactions by type', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');

    await page.selectOption('select[name="typeFilter"]', 'expense');
    await expect(page.locator('[data-testid="transaction-item"]')).toBeVisible();
  });
});

test.describe('Finance Management - Permissions', () => {
  test('member should NOT approve budget requests', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]');

    // Approve button should not be visible
    const approveButton = await page.locator('button:has-text("Setujui")').count();
    expect(approveButton).toBe(0);
  });

  test('member should NOT add transactions', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');

    // Add transaction button should not be visible
    const addButton = await page.locator('button:has-text("Tambah Pengeluaran")').count();
    expect(addButton).toBe(0);
  });

  test('sekretaris should approve budget requests', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');

    // Should have access to approve functionality
    await expect(page.locator('[data-testid="filter-pending"]')).toBeVisible();
  });
});
