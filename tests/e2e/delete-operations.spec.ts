import { test, expect } from '@playwright/test';
import { loginAs, createTestLetterData, createTestMeetingData, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for DELETE Operations
 *
 * Tests delete/remove/deactivate for all entities
 */

test.describe('Delete - Letters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should delete pending letter', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Surat berhasil dihapus');
  });

  test('should NOT delete processing/sent letter', async ({ page }) => {
    await page.goto('/dashboard/letters');
    const processingLetters = await page.locator('[data-testid="letter-item"]:has-text("processing")').count();

    if (processingLetters > 0) {
      await page.click('[data-testid="letter-item"]:has-text("processing")');

      const deleteButton = await page.locator('button:has-text("Hapus")').count();
      expect(deleteButton).toBe(0);
    }
  });

  test('should show confirmation before delete', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');

    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('text=/yakin.*hapus|confirm.*delete/i')).toBeVisible();
  });

  test('should cancel delete operation', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Batal")');

    // Should remain on detail page
    await expect(page.locator('[data-testid="letter-item"]')).toBeVisible();
  });

  test('should remove deleted letter from list', async ({ page }) => {
    await page.goto('/dashboard/letters');

    const initialCount = await page.locator('[data-testid="letter-item"]').count();

    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Surat berhasil dihapus');
    await page.goto('/dashboard/letters');

    const newCount = await page.locator('[data-testid="letter-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('Delete - Meetings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should delete future meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Rapat berhasil dihapus');
  });

  test('should NOT delete past meeting with notes', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    const pastMeetings = await page.locator('[data-testid="meeting-item"]:has-text("past")').count();

    if (pastMeetings > 0) {
      await page.click('[data-testid="meeting-item"]:has-text("past")');
      const deleteButton = await page.locator('button:has-text("Hapus")').count();
      expect(deleteButton).toBe(0);
    }
  });

  test('should confirm meeting deletion', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Hapus")');

    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
  });

  test('should cancel meeting deletion', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Batal")');

    await expect(page.locator('[data-testid="meeting-item"]')).toBeVisible();
  });
});

test.describe('Delete - KPI & Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should delete task', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Tugas berhasil dihapus');
  });

  test('should delete KPI item', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Hapus KPI")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'KPI berhasil dihapus');
  });

  test('should show warning when deleting milestone KPI', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    const milestoneKpi = await page.locator('[data-testid="kpi-item"]:has([data-testid="milestone-badge"])').count();

    if (milestoneKpi > 0) {
      await page.click('[data-testid="kpi-item"]:has([data-testid="milestone-badge"])');
      await page.click('button:has-text("Hapus KPI")');

      await expect(page.locator('text=/milestone.*warning|peringatan.*milestone/i')).toBeVisible();
    }
  });
});

test.describe('Delete - Finance', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'sekretaris');
  });

  test('should delete transaction', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="budget-item"]');
    await page.click('[data-testid="transaction-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Transaksi berhasil dihapus');
  });

  test('should cancel budget request while pending', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("pending")');
    await page.click('button:has-text("Batalkan")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Pengajuan dibatalkan');
  });

  test('should NOT cancel approved budget request', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/finance');
    await page.click('[data-testid="requests-tab"]');
    await page.click('[data-testid="request-item"]:has-text("approved")');

    const cancelButton = await page.locator('button:has-text("Batalkan")').count();
    expect(cancelButton).toBe(0);
  });
});

test.describe('Delete - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should delete role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Role berhasil dihapus');
  });

  test('should NOT delete system role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('[data-testid="role-item"]:has-text("Admin")');
    await page.click('button:has-text("Hapus")');

    // Should show error that system role cannot be deleted
    await expect(page.locator('text=/tidak.*dihapus|cannot.*delete/i')).toBeVisible();
  });

  test('should delete division', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('[data-testid="division-item"]');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Divisi berhasil dihapus');
  });

  test('should NOT delete division with active members', async ({ page }) => {
    await page.goto('/admin/divisions');
    const divisionWithMembers = await page.locator('[data-testid="division-item"]:has([data-testid="member-count"])').count();

    if (divisionWithMembers > 0) {
      await page.click('[data-testid="division-item"]:has([data-testid="member-count"])');
      await page.click('button:has-text("Hapus")');

      await expect(page.locator('text=/masih.*anggota|still.*member/i')).toBeVisible();
    }
  });
});

test.describe('Delete - Confirmation & Undo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show confirmation dialog with action details', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');

    // Confirmation dialog should show what's being deleted
    const dialogText = await page.locator('[data-testid="confirm-dialog"]').textContent();
    expect(dialogText).toMatch(/hapus|delete|yakin|confirm/i);
  });

  test('should show undo option', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    // Toast should have undo action
    const undoButton = await page.locator('button:has-text("Urungkan")').count();
    if (undoButton > 0) {
      await page.click('button:has-text("Urungkan")');
      await waitForToast(page, 'Dikembalikan');
    }
  });
});
