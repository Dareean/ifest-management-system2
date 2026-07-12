import { test, expect } from '@playwright/test';
import { loginAs, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for KPI EDIT Operations
 *
 * Tests editing KPI items and task management
 */

test.describe('KPI Edit - KPI Item Fields', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should edit KPI title', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="title"]', 'Updated KPI Title - Edited');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil diperbarui');
    await expect(page.locator('text=/Updated KPI Title/i')).toBeVisible();
  });

  test('should edit KPI target', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('textarea[name="target"]', 'Updated target: Achieve 95% completion rate');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil diperbarui');
    await expect(page.locator('text=/95% completion/i')).toBeVisible();
  });

  test('should edit KPI deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="deadline"]', '2026-12-31');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil diperbarui');
  });

  test('should toggle milestone status', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.click('input[name="isMilestone"]');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil diperbarui');
    await expect(page.locator('[data-testid="milestone-badge"]')).toBeVisible();
  });

  test('should cancel KPI edit', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="title"]', 'Changed but will cancel');
    await page.click('button:has-text("Batal")');

    await expect(page.locator('text=/Changed but will cancel/i')).not.toBeVisible();
  });
});

test.describe('KPI Edit - Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should edit task title', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', 'Updated Task Title');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil diperbarui');
    await expect(page.locator('text=/Updated Task Title/i')).toBeVisible();
  });

  test('should edit task description', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('textarea[name="description"]', 'Updated task description with more details.');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil diperbarui');
  });

  test('should update task status', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    await page.selectOption('select[name="status"]', 'in_progress');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Status berhasil diperbarui');
    await expect(page.locator('text=/in_progress/i')).toBeVisible();
  });

  test('should mark task as done', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]:has-text("in_progress")');

    await page.selectOption('select[name="status"]', 'done');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Tugas selesai');
    await expect(page.locator('[data-testid="completed-badge"]')).toBeVisible();
  });

  test('should change task priority', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil diperbarui');
    await expect(page.locator('[data-testid="priority-high"]')).toBeVisible();
  });

  test('should update task deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="deadline"]', '2026-09-30');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil diperbarui');
  });

  test('should reassign task to different member', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.selectOption('select[name="assignedTo"]', { index: 1 });
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil diperbarui');
  });

  test('should update KPI progress when task status changes', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');

    // Get initial progress
    const initialProgress = await page.locator('[data-testid="kpi-progress"]').textContent();

    // Update task status
    await page.click('[data-testid="task-item"]:has-text("pending")');
    await page.selectOption('select[name="status"]', 'done');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Status berhasil diperbarui');

    // Progress should have changed
    const newProgress = await page.locator('[data-testid="kpi-progress"]').textContent();
    expect(newProgress).not.toBe(initialProgress);
  });
});

test.describe('KPI Edit - Permissions', () => {
  test('member should edit own tasks', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    // Should be able to change status
    await expect(page.locator('select[name="status"]')).toBeEnabled();
  });

  test('member should NOT edit KPI items', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');

    // Edit KPI button should not appear for regular members
    const editKpiButton = await page.locator('button:has-text("Edit KPI")').count();
    expect(editKpiButton).toBe(0);
  });

  test('admin should edit any KPI item', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="title"]', 'Admin Edited KPI');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil diperbarui');
  });

  test('member should NOT edit other member tasks', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    // If task is assigned to someone else, edit button should not appear
    const assignedTo = await page.locator('[data-testid="task-assignee"]').textContent();
    if (assignedTo && !assignedTo.includes('Test Member')) {
      const editButton = await page.locator('button:has-text("Edit")').count();
      expect(editButton).toBe(0);
    }
  });
});

test.describe('KPI Edit - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should prevent empty KPI title', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="title"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should prevent empty task title', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');
    await page.click('button:has-text("Edit")');

    await page.fill('input[name="title"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should prevent past deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Edit KPI")');

    await page.fill('input[name="deadline"]', '2020-01-01');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/deadline.*future|tanggal.*akan datang/i')).toBeVisible();
  });
});
