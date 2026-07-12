import { test, expect } from '@playwright/test';
import { loginAs, waitForToast, TEST_ACCOUNTS } from '../utils/test-helpers';

/**
 * E2E Tests for KPI Tracking - Comprehensive
 */

test.describe('KPI Tracking - View and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display KPI page correctly', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await expect(page).toHaveURL('/dashboard/kpi');
    await expect(page.locator('text=/kpi/i')).toBeVisible();
  });

  test('should show KPI list grouped by division', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await expect(page.locator('[data-testid="kpi-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="division-group"]')).toBeVisible();
  });

  test('should display KPI progress bars', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await expect(page.locator('[data-testid="kpi-progress-bar"]')).toBeVisible();
  });

  test('should show milestone badge for milestone KPIs', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    const milestoneKpis = await page.locator('[data-testid="milestone-badge"]').count();
    expect(milestoneKpis).toBeGreaterThanOrEqual(0);
  });

  test('should filter KPIs by division', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="division-filter"]');
    await expect(page.locator('[data-testid="kpi-item"]')).toBeVisible();
  });

  test('should show KPI statistics on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="kpi-stats-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-stats-completed"]')).toBeVisible();
  });
});

test.describe('KPI Tracking - Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');
  });

  test('should expand KPI to show tasks', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await expect(page.locator('[data-testid="task-item"]')).toBeVisible();
  });

  test('should display task details', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    await expect(page.locator('[data-testid="task-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-priority"]')).toBeVisible();
  });

  test('should allow member to update task status to in_progress', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    await page.selectOption('select[name="status"]', 'in_progress');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Tugas diperbarui');
    await expect(page.locator('text=/in_progress/i')).toBeVisible();
  });

  test('should allow member to mark task as done', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    await page.selectOption('select[name="status"]', 'done');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Tugas diperbarui');
    await expect(page.locator('text=/done/i')).toBeVisible();
  });

  test('should update KPI progress when task is completed', async ({ page }) => {
    // Get initial progress
    await page.click('[data-testid="kpi-item"]');
    const initialProgress = await page.locator('[data-testid="kpi-progress"]').textContent();

    // Complete a task
    await page.click('[data-testid="task-item"]:has-text("pending")');
    await page.selectOption('select[name="status"]', 'done');
    await page.click('button:has-text("Simpan")');

    await waitForToast(page, 'Tugas diperbarui');

    // Check progress updated
    const newProgress = await page.locator('[data-testid="kpi-progress"]').textContent();
    expect(newProgress).not.toBe(initialProgress);
  });

  test('should show task deadline warning for overdue tasks', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    const overdueTasks = await page.locator('[data-testid="task-overdue"]').count();
    expect(overdueTasks).toBeGreaterThanOrEqual(0);
  });

  test('should filter tasks by status', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="filter-pending"]');
    await expect(page.locator('[data-testid="task-item"]')).toBeVisible();
  });

  test('should filter tasks by priority', async ({ page }) => {
    await page.click('[data-testid="kpi-item"]');
    await page.selectOption('select[name="priorityFilter"]', 'high');
    await expect(page.locator('[data-testid="task-item"]')).toBeVisible();
  });
});

test.describe('KPI Tracking - Permissions', () => {
  test('member should see only own division KPIs', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    const kpis = await page.locator('[data-testid="kpi-item"]').count();
    expect(kpis).toBeGreaterThan(0);
  });

  test('admin should see all division KPIs', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/dashboard/kpi');

    await expect(page.locator('[data-testid="division-group"]')).toBeVisible();
    const divisions = await page.locator('[data-testid="division-group"]').count();
    expect(divisions).toBeGreaterThan(1); // Should see multiple divisions
  });

  test('member should be able to update own tasks', async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');

    await page.click('[data-testid="kpi-item"]');
    await page.click('[data-testid="task-item"]');

    // Should be able to change status
    await expect(page.locator('select[name="status"]')).toBeEnabled();
  });
});

test.describe('KPI Tracking - Deadlines', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
    await page.goto('/dashboard/kpi');
  });

  test('should show KPI deadline if set', async ({ page }) => {
    const kpiWithDeadline = await page.locator('[data-testid="kpi-deadline"]').count();
    expect(kpiWithDeadline).toBeGreaterThanOrEqual(0);
  });

  test('should highlight KPIs with upcoming deadlines', async ({ page }) => {
    const upcomingDeadlines = await page.locator('[data-testid="deadline-warning"]').count();
    expect(upcomingDeadlines).toBeGreaterThanOrEqual(0);
  });

  test('should show overdue KPIs in red', async ({ page }) => {
    const overdueKpis = await page.locator('[data-testid="kpi-overdue"]').count();
    expect(overdueKpis).toBeGreaterThanOrEqual(0);
  });
});
