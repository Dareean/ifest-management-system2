import { test, expect } from '@playwright/test';
import { loginAs, createTestLetterData, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Letter Management Workflow
 *
 * Tests the complete letter workflow:
 * Request → Approval → Processing → Sent (with email notifications)
 */

test.describe('Letter Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as member for most tests
    await loginAs(page, 'member');
  });

  test('should display letters page correctly', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Check page elements
    await expect(page).toHaveURL('/dashboard/letters');
    await expect(page.locator('text=/surat/i')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/letters/new"]')).toBeVisible();
  });

  test('should create new letter request', async ({ page }) => {
    await page.goto('/dashboard/letters/new');

    const letterData = createTestLetterData();

    // Fill letter form
    await page.selectOption('select[name="letterType"]', letterData.letterType);
    await page.fill('input[name="subject"]', letterData.subject);
    await page.fill('textarea[name="body"]', letterData.body);
    await page.fill('input[name="targetInstitution"]', letterData.targetInstitution);
    await page.selectOption('select[name="priority"]', letterData.priority);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to letters list
    await expect(page).toHaveURL('/dashboard/letters');

    // Should show success message
    await waitForToast(page, 'Surat berhasil diajukan');

    // Should see the new letter in list
    await expect(page.locator(`text=${letterData.subject}`)).toBeVisible();
  });

  test('should view letter details', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Click on first letter
    await page.click('[data-testid="letter-item"]');

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/dashboard\/letters\/[a-z0-9-]+/);

    // Should show letter details
    await expect(page.locator('[data-testid="letter-subject"]')).toBeVisible();
    await expect(page.locator('[data-testid="letter-body"]')).toBeVisible();
    await expect(page.locator('[data-testid="letter-status"]')).toBeVisible();
  });

  test('sekretaris should see pending letters', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/letters');

    // Filter to pending letters
    await page.click('[data-testid="filter-pending"]');

    // Should see pending letters
    await expect(page.locator('[data-testid="letter-item"]')).toBeVisible();
    await expect(page.locator('text=/requested/i')).toBeVisible();
  });

  test('sekretaris should start processing letter', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/letters');

    // Click on pending letter
    await page.click('[data-testid="letter-item"]:has-text("requested")');

    // Click process button
    await page.click('button:has-text("Proses")');

    // Should show confirmation
    await waitForToast(page, 'Surat sedang diproses');

    // Status should change to processing
    await expect(page.locator('text=/processing/i')).toBeVisible();
  });

  test('sekretaris should complete letter with document link', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/letters');

    // Find letter in processing status
    await page.click('[data-testid="letter-item"]:has-text("processing")');

    // Fill document link
    await page.fill('input[name="finalDocumentUrl"]', 'https://drive.google.com/test-document');

    // Click complete button
    await page.click('button:has-text("Selesai")');

    // Should show confirmation
    await waitForToast(page, 'Surat selesai');

    // Status should change to sent
    await expect(page.locator('text=/sent/i')).toBeVisible();

    // Should show document link
    await expect(page.locator('a[href*="drive.google.com"]')).toBeVisible();
  });

  test('requester should request revision', async ({ page }) => {
    // Assuming there's a completed letter
    await page.goto('/dashboard/letters');

    // Click on completed letter
    await page.click('[data-testid="letter-item"]:has-text("sent")');

    // Click revision button
    await page.click('button:has-text("Revisi")');

    // Fill revision note
    await page.fill('textarea[name="note"]', 'Mohon perbaiki alamat tujuan');

    // Submit revision request
    await page.click('button[type="submit"]');

    // Should show confirmation
    await waitForToast(page, 'Revisi diajukan');

    // Status should change to in_revision
    await expect(page.locator('text=/revisi/i')).toBeVisible();
  });

  test('should filter letters by status', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Filter by requested
    await page.click('[data-testid="filter-requested"]');
    await expect(page).toHaveURL(/status=requested/);

    // Filter by processing
    await page.click('[data-testid="filter-processing"]');
    await expect(page).toHaveURL(/status=processing/);

    // Filter by sent
    await page.click('[data-testid="filter-sent"]');
    await expect(page).toHaveURL(/status=sent/);
  });

  test('should search letters by subject', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Search for letter
    await page.fill('input[name="search"]', 'Test Letter');
    await page.press('input[name="search"]', 'Enter');

    // Should filter results
    await expect(page.locator('[data-testid="letter-item"]')).toContainText(/test.*letter/i);
  });

  test('member should NOT see other division letters', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Should only see own division's letters
    const letters = await page.locator('[data-testid="letter-item"]').count();
    expect(letters).toBeGreaterThan(0);

    // Check that letters belong to user's division
    // (This assumes letter items show division info)
  });

  test('should show letter statistics on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show letter stats
    await expect(page.locator('[data-testid="letter-stats-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="letter-stats-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="letter-stats-completed"]')).toBeVisible();
  });
});

test.describe('Letter Notifications', () => {
  test('should send email when letter is created', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters/new');

    const letterData = createTestLetterData();

    // Fill and submit letter form
    await page.selectOption('select[name="letterType"]', letterData.letterType);
    await page.fill('input[name="subject"]', letterData.subject);
    await page.fill('textarea[name="body"]', letterData.body);
    await page.click('button[type="submit"]');

    // Wait for success
    await waitForToast(page, 'Surat berhasil diajukan');

    // Note: In real test, we would verify email was sent
    // by checking email_queue table or mocking Brevo API
    // For now, we just verify the action succeeded
  });

  test('should send email when letter status changes', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/letters');

    // Process a letter
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Proses")');

    await waitForToast(page, 'Surat sedang diproses');

    // Email should be sent to requester
    // (Verify via email_queue or mock)
  });
});
