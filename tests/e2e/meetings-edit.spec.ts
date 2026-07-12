import { test, expect } from '@playwright/test';
import { loginAs, createTestMeetingData, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Meeting EDIT Operations
 *
 * Tests editing existing meetings and meeting details
 */

test.describe('Meeting Edit - Basic Fields', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should edit meeting title', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Updated Meeting Title - Edited');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
    await expect(page.locator('text=/Updated Meeting Title/i')).toBeVisible();
  });

  test('should edit meeting date and time', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    const newDateTime = '2026-08-15T14:00';
    await page.fill('input[name="startedAt"]', newDateTime);
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
  });

  test('should edit meeting location', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="location"]', 'Updated Meeting Room B');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
    await expect(page.locator('text=/Meeting Room B/i')).toBeVisible();
  });

  test('should edit meeting link (online meeting)', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="meetingLink"]', 'https://meet.google.com/updated-link');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
    await expect(page.locator('a[href*="updated-link"]')).toBeVisible();
  });

  test('should edit meeting agenda', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="agenda"]', 'Updated agenda:\n1. Review progress\n2. Discuss new plans\n3. Q&A session');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
    await expect(page.locator('text=/Updated agenda/i')).toBeVisible();
  });

  test('should change meeting scope', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="scope"]', 'division');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
  });

  test('should cancel edit and discard changes', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Changed but will cancel');
    await page.click('button:has-text("Batal")');

    // Should return without saving
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('text=/Changed but will cancel/i')).not.toBeVisible();
  });
});

test.describe('Meeting Edit - Invitees', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should add invitees to existing meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Tambah Undangan")');

    await page.click('[data-testid="member-checkbox"]');
    await page.click('button:has-text("Kirim")');

    await waitForToast(page, 'Undangan ditambahkan');
  });

  test('should remove invitee from meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');

    await page.click('[data-testid="invitee-item"] button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Undangan dihapus');
  });

  test('should update invitee list without resending emails', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit Undangan")');

    // Add new invitees
    await page.click('[data-testid="member-checkbox"]');

    // Option to not resend emails
    await page.click('input[name="skipEmailNotification"]');
    await page.click('button:has-text("Update")');

    await waitForToast(page, 'Undangan diperbarui');
  });
});

test.describe('Meeting Edit - Notes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should edit meeting notes content', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    // Edit notes
    await page.fill('textarea[name="content"]', 'Updated meeting notes content with more details.');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Notulensi disimpan');
  });

  test('should add decision point to notes', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    await page.click('button:has-text("Tambah Keputusan")');
    await page.fill('input[name="newDecisionPoint"]', 'New decision: Approve budget increase');
    await page.click('button:has-text("Tambah")');

    await waitForToast(page, 'Keputusan ditambahkan');
  });

  test('should edit existing decision point', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    await page.click('[data-testid="decision-item"] button:has-text("Edit")');
    await page.fill('input[name="decisionPoint"]', 'Updated decision text');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Keputusan diperbarui');
  });

  test('should remove decision point', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    await page.click('[data-testid="decision-item"] button:has-text("Hapus")');
    await page.click('button:has-text("Ya")');

    await waitForToast(page, 'Keputusan dihapus');
  });

  test('should add action item to notes', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    await page.click('button:has-text("Tambah Tindak Lanjut")');
    await page.fill('input[name="newActionItem"]', 'Action: Prepare presentation for next meeting');
    await page.click('button:has-text("Tambah")');

    await waitForToast(page, 'Tindak lanjut ditambahkan');
  });

  test('should edit existing action item', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    await page.click('[data-testid="action-item"] button:has-text("Edit")');
    await page.fill('input[name="actionItem"]', 'Updated action item text');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Tindak lanjut diperbarui');
  });
});

test.describe('Meeting Edit - Permissions', () => {
  test('creator should be able to edit own meeting', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/meetings');

    // Find meeting created by current user
    await page.click('[data-testid="meeting-item"]:has([data-testid="creator-badge"])');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Creator Edited Meeting');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
  });

  test('sekretaris should be able to edit all-scope meetings', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/meetings');

    await page.click('[data-testid="meeting-item"]:has-text("all")');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Sekretaris Edited All-Scope Meeting');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
  });

  test('member should NOT edit other member meetings', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/meetings');

    // Try to find and edit another member's meeting
    await page.click('[data-testid="meeting-item"]');

    // Edit button should not appear or action should be blocked
    const editButton = await page.locator('button:has-text("Edit")').count();
    if (editButton === 0) {
      // Correct: No edit button shown
      expect(editButton).toBe(0);
    } else {
      // If button appears, action should fail
      await page.click('button:has-text("Edit")');
      await page.fill('input[name="title"]', 'Unauthorized Edit');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/tidak.*berwenang|permission/i')).toBeVisible();
    }
  });

  test('admin should be able to edit any meeting', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/meetings');

    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Admin Edited Meeting');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil diperbarui');
  });
});

test.describe('Meeting Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should prevent editing with empty title', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should prevent setting past date', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="startedAt"]', '2020-01-01T10:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/date.*future|tanggal.*akan datang/i')).toBeVisible();
  });

  test('should validate meeting link URL format', async ({ page }) => {
    await page.goto('/dashboard/meetings');
    await page.click('[data-testid="meeting-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="meetingLink"]', 'not-a-valid-url');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/url.*valid/i')).toBeVisible();
  });
});
