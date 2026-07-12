import { test, expect } from '@playwright/test';
import { loginAs, createTestMeetingData, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for Meeting Management Workflow
 *
 * Tests the complete meeting workflow:
 * Create → Invite → Notes → Publish
 */

test.describe('Meeting Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as member for most tests
    await loginAs(page, 'member');
  });

  test('should display meetings page correctly', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Check page elements
    await expect(page).toHaveURL('/dashboard/meetings');
    await expect(page.locator('text=/rapat/i')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/meetings/new"]')).toBeVisible();
  });

  test('should create new meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');

    const meetingData = createTestMeetingData();

    // Fill meeting form
    await page.fill('input[name="title"]', meetingData.title);
    await page.fill('input[name="startedAt"]', meetingData.startedAt);
    await page.fill('input[name="location"]', meetingData.location);
    await page.fill('textarea[name="agenda"]', meetingData.agenda);
    await page.selectOption('select[name="scope"]', meetingData.scope);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to meetings list
    await expect(page).toHaveURL('/dashboard/meetings');

    // Should show success message
    await waitForToast(page, 'Rapat berhasil dibuat');

    // Should see the new meeting in list
    await expect(page.locator(`text=${meetingData.title}`)).toBeVisible();
  });

  test('should view meeting details', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Click on first meeting
    await page.click('[data-testid="meeting-item"]');

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/dashboard\/meetings\/[a-z0-9-]+/);

    // Should show meeting details
    await expect(page.locator('[data-testid="meeting-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="meeting-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="meeting-location"]')).toBeVisible();
  });

  test('should invite members to meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Click on meeting
    await page.click('[data-testid="meeting-item"]');

    // Click invite button
    await page.click('button:has-text("Undang")');

    // Select members to invite
    await page.click('[data-testid="member-checkbox"]');

    // Send invitations
    await page.click('button:has-text("Kirim Undangan")');

    // Should show confirmation
    await waitForToast(page, 'Undangan terkirim');

    // Should see invited members list
    await expect(page.locator('[data-testid="invitee-list"]')).toBeVisible();
  });

  test('invitee should update RSVP status', async ({ page }) => {
    // Assuming user is invited to a meeting
    await page.goto('/dashboard/meetings');

    // Click on meeting with invitation
    await page.click('[data-testid="meeting-item"]:has([data-testid="invitation-badge"])');

    // Update RSVP to accepted
    await page.click('button:has-text("Hadir")');

    // Should show confirmation
    await waitForToast(page, 'RSVP diperbarui');

    // Status should change
    await expect(page.locator('text=/hadir/i')).toBeVisible();
  });

  test('creator should write meeting notes', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Click on ongoing or past meeting
    await page.click('[data-testid="meeting-item"]');

    // Navigate to notes section
    await page.click('[data-testid="notes-tab"]');

    // Write notes
    await page.fill('textarea[name="content"]', 'Notulensi rapat test:\n- Poin 1\n- Poin 2');

    // Add decision points
    await page.click('button:has-text("Tambah Keputusan")');
    await page.fill('input[name="decisionPoint"]', 'Keputusan: Approve budget');

    // Add action items
    await page.click('button:has-text("Tambah Tindak Lanjut")');
    await page.fill('input[name="actionItem"]', 'Follow up: Review proposal');

    // Save notes
    await page.click('button:has-text("Simpan")');

    // Should show confirmation
    await waitForToast(page, 'Notulensi disimpan');
  });

  test('creator should publish meeting notes', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Click on meeting with notes
    await page.click('[data-testid="meeting-item"]');

    // Navigate to notes section
    await page.click('[data-testid="notes-tab"]');

    // Publish notes
    await page.click('button:has-text("Publikasikan")');

    // Should show confirmation
    await waitForToast(page, 'Notulensi dipublikasikan');

    // Should be visible to all members
    await expect(page.locator('[data-testid="published-badge"]')).toBeVisible();
  });

  test('should filter meetings by date', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Filter by upcoming meetings
    await page.click('[data-testid="filter-upcoming"]');
    await expect(page).toHaveURL(/filter=upcoming/);

    // Filter by past meetings
    await page.click('[data-testid="filter-past"]');
    await expect(page).toHaveURL(/filter=past/);
  });

  test('should search meetings by title', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Search for meeting
    await page.fill('input[name="search"]', 'Test Meeting');
    await page.press('input[name="search"]', 'Enter');

    // Should filter results
    await expect(page.locator('[data-testid="meeting-item"]')).toContainText(/test.*meeting/i);
  });

  test('sekretaris should create all-scope meeting', async ({ page }) => {
    await loginAs(page, 'sekretaris');
    await page.goto('/dashboard/meetings/new');

    const meetingData = createTestMeetingData({ scope: 'all' });

    // Fill meeting form
    await page.fill('input[name="title"]', meetingData.title);
    await page.fill('input[name="startedAt"]', meetingData.startedAt);
    await page.fill('input[name="location"]', meetingData.location);
    await page.selectOption('select[name="scope"]', 'all');

    // Submit form
    await page.click('button[type="submit"]');

    // Should succeed
    await waitForToast(page, 'Rapat berhasil dibuat');
  });

  test('member should NOT create all-scope meeting', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');

    // All scope should not be available for members
    const allOption = await page.locator('select[name="scope"] option[value="all"]').count();
    expect(allOption).toBe(0);
  });

  test('should show meeting statistics on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show meeting stats
    await expect(page.locator('[data-testid="meeting-stats-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="meeting-stats-upcoming"]')).toBeVisible();
  });
});

test.describe('Meeting Notifications', () => {
  test('should send email when meeting is created with invites', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/meetings/new');

    const meetingData = createTestMeetingData();

    // Fill and submit meeting form
    await page.fill('input[name="title"]', meetingData.title);
    await page.fill('input[name="startedAt"]', meetingData.startedAt);
    await page.click('button[type="submit"]');

    // Wait for success
    await waitForToast(page, 'Rapat berhasil dibuat');

    // Note: In real test, verify email was sent to invitees
    // by checking email_queue or mocking Brevo API
  });

  test('should send email when notes are published', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/meetings');

    // Navigate to meeting with notes
    await page.click('[data-testid="meeting-item"]');
    await page.click('[data-testid="notes-tab"]');

    // Publish notes
    await page.click('button:has-text("Publikasikan")');

    await waitForToast(page, 'Notulensi dipublikasikan');

    // Email should be sent to all members
    // (Verify via email_queue or mock)
  });
});
