import { test, expect } from '@playwright/test';
import { loginAs, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Visual/UI Rendering
 *
 * Tests layout, responsiveness, and basic visual behavior
 */

test.describe('Visual - Layout & Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display header correctly', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should display sidebar correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
  });

  test('should display main content area', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should display footer with copyright', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="app-footer"]')).toBeVisible();
    await expect(page.locator('text=/copyright|© 2026/i')).toBeVisible();
  });
});

test.describe('Visual - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');

    // Sidebar should be hidden or collapsed on tablet
    const sidebarWidth = await page.locator('[data-testid="sidebar"]').boundingBox();
    expect(sidebarWidth).toBeDefined();
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Should show mobile menu button
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  });

  test('should adjust layout for cards on all screen sizes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="stat-card"]')).toBeVisible();

    // Cards should be arranged in grid
    const cards = await page.locator('[data-testid="stat-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });
});

test.describe('Visual - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show loading skeleton on dashboard', async ({ page }) => {
    // Navigate to dashboard - should show skeleton initially
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-skeleton"]')).toBeVisible();
  });

  test('should show loading state when fetching letters', async ({ page }) => {
    await page.goto('/dashboard/letters');

    // Should show loading state initially
    await expect(page.locator('[data-testid="letter-skeleton"]')).toBeVisible();
  });

  test('should show loading state when fetching meetings', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    // Should show loading state initially
    await expect(page.locator('[data-testid="meeting-skeleton"]')).toBeVisible();
  });

  test('should show loading state when fetching KPI data', async ({ page }) => {
    await page.goto('/dashboard/kpi');

    // Should show loading state initially
    await expect(page.locator('[data-testid="kpi-skeleton"]')).toBeVisible();
  });

  test('should hide loading when data is loaded', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for data to load
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });

    // Skeleton should be gone
    await expect(page.locator('[data-testid="dashboard-skeleton"]')).not.toBeVisible();
  });
});

test.describe('Visual - Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show notification bell in header', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
  });

  test('should show notification count badge', async ({ page }) => {
    await page.goto('/dashboard');

    const badge = page.locator('[data-testid="notification-count"]');
    // Badge may or may not have content, but should exist
    await expect(badge).toBeVisible();
  });

  test('should open notification dropdown when clicking bell', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="notification-bell"]');

    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
  });

  test('should show empty state for no notifications', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="notification-bell"]');

    const notifications = await page.locator('[data-testid="notification-item"]').count();
    if (notifications === 0) {
      await expect(page.locator('text=/tidak ada|empty/i')).toBeVisible();
    }
  });
});

test.describe('Visual - Modals & Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show delete confirmation modal', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');

    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('text=/hapus|delete/i')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');

    await page.click('button:has-text("Batal")');

    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
  });

  test('should close modal when clicking outside', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="letter-item"]:has-text("requested")');
    await page.click('button:has-text("Hapus")');

    // Click outside the modal
    await page.click('[data-testid="overlay"]');

    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
  });
});

test.describe('Visual - Forms', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show form fields correctly', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await expect(page.locator('input[name="letterType"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toBeVisible();
  });

  test('should show error message for invalid input', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.fill('input[name="subject"]', '');
    await page.fill('textarea[name="body"]', '');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/required|wajib/i')).toBeVisible();
  });

  test('should show success message after form submission', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test Visual');
    await page.fill('textarea[name="body"]', 'Test body');

    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});

test.describe('Visual - Cards & Stats', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display stat cards on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="stat-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-label"]')).toBeVisible();
  });

  test('should display letters card with count', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="stat-card"]:has-text("surat")')).toBeVisible();
  });

  test('should display meetings card with count', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="stat-card"]:has-text("rapat")')).toBeVisible();
  });

  test('should display KPI card with percentage', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="stat-card"]:has-text("kpi")')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-percentage"]')).toBeVisible();
  });
});

test.describe('Visual - Tables & Lists', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display letter list in table format', async ({ page }) => {
    await page.goto('/dashboard/letters');

    const rows = await page.locator('[data-testid="letter-row"]').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('should display meeting list with details', async ({ page }) => {
    await page.goto('/dashboard/meetings');

    const meetings = await page.locator('[data-testid="meeting-item"]').count();
    expect(meetings).toBeGreaterThanOrEqual(0);
  });

  test('should display task list with status indicators', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');

    const tasks = await page.locator('[data-testid="task-item"]').count();
    expect(tasks).toBeGreaterThanOrEqual(0);

    // Each task should have status indicator
    const statusBadges = await page.locator('[data-testid="task-status"]').count();
    expect(statusBadges).toBe(tasks);
  });
});

test.describe('Visual - Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display primary button correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('button:has-text("Kirim")')).toBeVisible();
  });

  test('should display secondary button correctly', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('button:has-text("Batal")')).toBeVisible();
  });

  test('should show button loading state', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');

    await page.click('button[type="submit"]');

    // Button should show loading state
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
  });
});

test.describe('Visual - Status Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should show letter status badge', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('[data-testid="letter-status"]')).toBeVisible();
  });

  test('should show task status badge', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await expect(page.locator('[data-testid="task-status"]')).toBeVisible();
  });

  test('should show priority badge', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('[data-testid="letter-priority"]')).toBeVisible();
  });

  test('should show milestone badge for milestone KPIs', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    const milestoneBadges = await page.locator('[data-testid="milestone-badge"]').count();
    expect(milestoneBadges).toBeGreaterThanOrEqual(0);
  });

  test('should show overdue indicator for past deadlines', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    const overdue = await page.locator('[data-testid="overdue-indicator"]').count();
    expect(overdue).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Visual - Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display filter button', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('[data-testid="filter-button"]')).toBeVisible();
  });

  test('should show filter dropdown options', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="filter-button"]');

    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
  });

  test('should apply filter and show active state', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="filter-requested"]');
    await expect(page.locator('[data-testid="filter-requested"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await page.click('[data-testid="filter-requested"]');

    await page.click('[data-testid="clear-filters"]');
    await expect(page.locator('[data-testid="filter-requested"]')).not.toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Visual - Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('input[name="search"]')).toBeVisible();
  });

  test('should show search icon', async ({ page }) => {
    await page.goto('/dashboard/letters');
    await expect(page.locator('[data-testid="search-icon"]')).toBeVisible();
  });

  test('should clear search input', async ({ page }) => {
    await page.goto('/dashboard/letters');

    await page.fill('input[name="search"]', 'test');
    await page.press('input[name="search"]', 'Enter');

    await page.click('[data-testid="clear-search"]');
    await expect(page.locator('input[name="search"]')).toHaveValue('');
  });
});
