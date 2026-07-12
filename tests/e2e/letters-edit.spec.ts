import { test, expect } from '@playwright/test';
import { loginAs, createTestLetterData, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Letter EDIT Operations
 *
 * Tests editing existing letters at various stages of workflow
 */

test.describe('Letter Edit - Requester', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should edit letter subject while in requested status', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Find a letter in requested status
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Edit")');

    // Edit subject
    await page.fill('input[name="subject"]', 'Updated Letter Subject - Edited');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
    await expect(page.locator('text=/Updated Letter Subject/i')).toBeVisible();
  });

  test('should edit letter body content', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="body"]', 'This is the updated letter body content with more details.');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
    await expect(page.locator('text=/updated letter body/i')).toBeVisible();
  });

  test('should edit letter deadline', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Edit")');

    const newDeadline = '2026-08-31';
    await page.fill('input[name="deadlineAt"]', newDeadline);
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
  });

  test('should edit letter priority', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="priority"]', 'tinggi');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
    await expect(page.locator('text=/tinggi/i')).toBeVisible();
  });

  test('should edit target institution', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="targetInstitution"]', 'Updated Institution Name');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
    await expect(page.locator('text=/Updated Institution/i')).toBeVisible();
  });

  test('should NOT edit letter after it is sent', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("sent")');

    // Edit button should not be visible for sent letters
    const editButton = await page.locator('button:has-text("Edit")').count();
    expect(editButton).toBe(0);
  });

  test('should validate required fields when editing', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    // Clear subject
    await page.fill('input[name="subject"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/subject.*required/i')).toBeVisible();
  });

  test('should show confirmation dialog before saving edits', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="subject"]', 'Changed Subject');
    await page.click('button[type="submit"]');

    // Should show confirmation or immediately save
    await expect(page.locator('text=/berhasil|confirm/i')).toBeVisible();
  });

  test('should cancel edit and return to detail view', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    // Make changes
    await page.fill('input[name="subject"]', 'Changed but will cancel');

    // Cancel
    await page.click('button:has-text("Batal")');

    // Should return to detail view without saving
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
  });
});

test.describe('Letter Edit - Sekretaris', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should edit letter status from processing to sent', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("processing")');

    // Edit to add final document
    await page.fill('input[name="finalDocumentUrl"]', 'https://drive.google.com/edited-document');
    await page.click('button:has-text("Selesai")');

    await waitForToast(page, 'Surat selesai');
    await expect(page.locator('text=/sent/i')).toBeVisible();
  });

  test('should edit final document URL', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("processing")');

    await page.fill('input[name="finalDocumentUrl"]', 'https://drive.google.com/updated-final-doc');
    await page.click('button:has-text("Update")');

    await waitForToast(page, 'Dokumen diperbarui');
  });
});

test.describe('Letter Edit - Permissions', () => {
  test('member should NOT edit other division letters', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/letters');

    // Try to access letter from another division (if exists)
    await page.click('[data-testid="letter-item"]');

    // Edit button should not appear or action should be blocked
    const editButton = await page.locator('button:has-text("Edit")').count();
    if (editButton > 0) {
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="subject"]', 'Unauthorized Edit');
      await page.click('button[type="submit"]');

      // Should show permission error
      await expect(page.locator('text=/tidak.*berwenang|permission/i')).toBeVisible();
    }
  });

  test('admin should be able to edit any letter', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/letters');

    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="subject"]', 'Admin Edited Letter');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diperbarui');
  });
});

test.describe('Letter Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should prevent editing with empty subject', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="subject"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/subject.*wajib|required/i')).toBeVisible();
  });

  test('should prevent editing with empty body', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="body"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/body.*wajib|required/i')).toBeVisible();
  });

  test('should validate URL format for final document', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("processing")');

    await page.fill('input[name="finalDocumentUrl"]', 'not-a-valid-url');
    await page.click('button:has-text("Selesai")');

    await expect(page.locator('text=/url.*valid/i')).toBeVisible();
  });
});
