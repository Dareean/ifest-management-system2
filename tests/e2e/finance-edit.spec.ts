import { test, expect } from '@playwright/test';
import { loginAs, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Finance EDIT Operations
 *
 * Tests editing budgets, transactions, and budget requests
 */

test.describe('Finance Edit - Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should edit division budget amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '10000000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Budget berhasil diperbarui');
    await expect(page.locator('text=/10.*000.*000/i')).toBeVisible();
  });

  test('should increase budget allocation', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');

    const currentBudget = await page.locator('[data-testid="total-budget"]').textContent();
    const currentAmount = parseInt(currentBudget!.replace(/\D/g, ''));

    await page.click('button:has-text("Edit Budget")');
    await page.fill('input[name="totalBudget"]', (currentAmount + 1000000).toString());
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Budget berhasil diperbarui');
  });

  test('should show updated remaining budget after edit', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '15000000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Budget berhasil diperbarui');

    // Remaining should be recalculated
    await expect(page.locator('[data-testid="remaining-budget"]')).toBeVisible();
  });

  test('should cancel budget edit', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '99999999');
    await page.click('button:has-text("Batal")');

    await expect(page.locator('text=/99.*999.*999/i')).not.toBeVisible();
  });
});

test.describe('Finance Edit - Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should edit transaction amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="amount"]', '750000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil diperbarui');
  });

  test('should edit transaction description', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="description"]', 'Updated transaction description - Payment for supplies');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil diperbarui');
    await expect(page.locator('text=/Updated transaction/i')).toBeVisible();
  });

  test('should edit transaction category', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="category"]', 'Equipment');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil diperbarui');
    await expect(page.locator('text=/Equipment/i')).toBeVisible();
  });

  test('should edit transaction date', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="transactionDate"]', '2026-07-15');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil diperbarui');
  });

  test('should update budget balance after transaction edit', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');

    const initialRemaining = await page.locator('[data-testid="remaining-budget"]').textContent();

    await page.click('[data-testid="transaction-item"]:has-text("expense")');
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="amount"]', '1000000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Transaksi berhasil diperbarui');
    await page.goto('/dashboard/finance');

    const newRemaining = await page.locator('[data-testid="remaining-budget"]').textContent();
    expect(newRemaining).not.toBe(initialRemaining);
  });
});

test.describe('Finance Edit - Budget Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should edit budget request amount while pending', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="amount"]', '2500000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Pengajuan berhasil diperbarui');
  });

  test('should edit budget request purpose', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="purpose"]', 'Updated purpose: Purchase additional equipment and materials');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Pengajuan berhasil diperbarui');
    await expect(page.locator('text=/additional equipment/i')).toBeVisible();
  });

  test('should NOT edit approved budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("approved")');

    // Edit button should not appear for approved requests
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });

  test('should NOT edit rejected budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("rejected")');

    // Edit button should not appear for rejected requests
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });
});

test.describe('Finance Edit - Sekretaris Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should edit approval notes for budget request', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("approved")');
    await page.click('button:has-text("Edit Notes")');

    await page.fill('textarea[name="notes"]', 'Updated notes: Approved with additional conditions');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Catatan berhasil diperbarui');
  });

  test('should change request status from pending to approved', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');

    await page.click('button:has-text("Setujui")');
    await page.fill('textarea[name="notes"]', 'Approved for event budget');
    await page.click('button:has-text("Konfirmasi")');

    await waitForToast(page, 'Pengajuan disetujui');
    await expect(page.locator('text=/approved/i')).toBeVisible();
  });
});

test.describe('Finance Edit - Permissions', () => {
  test('member should NOT edit other division budgets', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');

    await page.click('[data-testid="budget-item"]');

    // Edit budget button should not appear for members
    const editButton = await page.locator('button:has-text("Edit Budget")').count();
    expect(editButton).toBe(0);
  });

  test('member should NOT edit transactions', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');

    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');

    // Edit button should not appear
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });

  test('sekretaris should edit any budget', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/finance');

    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '20000000');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Budget berhasil diperbarui');
  });
});

test.describe('Finance Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should prevent negative budget amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '-1000000');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*positive|jumlah.*positif/i')).toBeVisible();
  });

  test('should prevent zero budget amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('button:has-text("Edit Budget")');

    await page.fill('input[name="totalBudget"]', '0');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*greater|jumlah.*lebih besar/i')).toBeVisible();
  });

  test('should prevent empty transaction description', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="description"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/description.*required|deskripsi.*wajib/i')).toBeVisible();
  });
});
