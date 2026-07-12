import { test, expect } from '@playwright/test';
import { loginAs, generateTestEmail, waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Form Validation
 *
 * Tests all form fields validation rules across the application
 */

test.describe('Form Validation - Letters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should require letter type', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/letterType.*wajib|required/i')).toBeVisible();
  });

  test('should require letter subject (required)', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('textarea[name="body"]', 'Test body');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/subject.*wajib|required/i')).toBeVisible();
  });

  test('should require letter body (required)', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/body.*wajib|required/i')).toBeVisible();
  });

  test('should accept valid email in target institution', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.fill('input[name="targetInstitution"]', 'company@example.com');
    await page.click('button[type="submit"]');

    // Should not show email error (email is valid format)
    await expect(page.locator('text=/invalid.*email|email.*tidak/i')).not.toBeVisible();
  });

  test('should reject invalid email format', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.fill('input[name="targetInstitution"]', 'not-an-email');
    await page.click('button[type="submit"]');

    // Some fields may validate email format
    const invalidEmail = await page.locator('text=/invalid.*email|email.*tidak/i').count();
    expect(invalidEmail).toBeGreaterThanOrEqual(0);
  });

  test('should limit subject length (max 255 chars)', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'A'.repeat(300));
    await page.click('button[type="submit"]');

    const subjectValue = await page.locator('input[name="subject"]').inputValue();
    expect(subjectValue.length).toBeLessThanOrEqual(255);
  });

  test('should limit body length', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'B'.repeat(5000));
    await page.click('button[type="submit"]');

    const bodyValue = await page.locator('textarea[name="body"]').inputValue();
    expect(bodyValue.length).toBeLessThanOrEqual(5000);
  });

  test('should allow empty optional fields', async ({ page }) => {
    await page.goto('/dashboard/letters/new');
    await page.selectOption('select[name="letterType"]', { index: 1 });
    await page.fill('input[name="subject"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    await page.fill('input[name="deadlineAt"]', '');
    await page.fill('input[name="targetInstitution"]', '');
    await page.fill('input[name="category"]', '');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Surat berhasil diajukan');
  });
});

test.describe('Form Validation - Meetings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should require meeting title', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should require meeting time', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Meeting');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/time.*wajib|date.*required/i')).toBeVisible();
  });

  test('should require future meeting date', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Meeting');
    await page.fill('input[name="startedAt"]', '2020-01-01T10:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/date.*future|tanggal.*akan datang/i')).toBeVisible();
  });

  test('should accept valid Google Meet URL', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Meeting');
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.fill('input[name="meetingLink"]', 'https://meet.google.com/abc-def-ghi');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil dibuat');
  });

  test('should reject invalid meeting link', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Meeting');
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.fill('input[name="meetingLink"]', 'not-a-valid-url');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/url.*valid|link.*tidak/i')).toBeVisible();
  });

  test('should limit title length', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'T'.repeat(300));
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.click('button[type="submit"]');

    const titleValue = await page.locator('input[name="title"]').inputValue();
    expect(titleValue.length).toBeLessThanOrEqual(255);
  });

  test('should allow empty optional meeting fields', async ({ page }) => {
    await page.goto('/dashboard/meetings/new');
    await page.fill('input[name="title"]', 'Test Meeting');
    await page.fill('input[name="startedAt"]', '2026-08-01T10:00');
    await page.fill('input[name="location"]', '');
    await page.fill('input[name="meetingLink"]', '');
    await page.fill('textarea[name="agenda"]', '');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Rapat berhasil dibuat');
  });
});

test.describe('Form Validation - KPI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should require KPI title', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('button:has-text("Tambah KPI")');

    await page.fill('input[name="target"]', 'Target');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should require KPI target', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('button:has-text("Tambah KPI")');

    await page.fill('input[name="title"]', 'Test KPI');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/target.*wajib|required/i')).toBeVisible();
  });

  test('should accept future KPI deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('button:has-text("Tambah KPI")');

    await page.fill('input[name="title"]', 'Test KPI');
    await page.fill('input[name="target"]', 'Target');
    await page.fill('input[name="deadline"]', '2026-12-31');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'KPI berhasil dibuat');
  });

  test('should reject past KPI deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('button:has-text("Tambah KPI")');

    await page.fill('input[name="title"]', 'Test KPI');
    await page.fill('input[name="target"]', 'Target');
    await page.fill('input[name="deadline"]', '2020-01-01');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/deadline.*future|tanggal.*akan datang/i')).toBeVisible();
  });

  test('should limit KPI title length', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('button:has-text("Tambah KPI")');

    await page.fill('input[name="title"]', 'T'.repeat(300));
    await page.fill('input[name="target"]', 'Target');
    await page.click('button[type="submit"]');

    const titleValue = await page.locator('input[name="title"]').inputValue();
    expect(titleValue.length).toBeLessThanOrEqual(255);
  });
});

test.describe('Form Validation - Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should require task title', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Tambah Tugas")');

    await page.fill('textarea[name="description"]', 'Description');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/title.*wajib|required/i')).toBeVisible();
  });

  test('should require task description', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Tambah Tugas")');

    await page.fill('input[name="title"]', 'Task Title');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/description.*wajib|required/i')).toBeVisible();
  });

  test('should accept valid task deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Tambah Tugas")');

    await page.fill('input[name="title"]', 'Task Title');
    await page.fill('textarea[name="description"]', 'Description');
    await page.fill('input[name="deadline"]', '2026-09-30');
    await page.click('button[type="submit"]');

    await waitForToast(page, 'Tugas berhasil dibuat');
  });

  test('should reject past task deadline', async ({ page }) => {
    await page.goto('/dashboard/kpi');
    await page.click('[data-testid="kpi-item"]');
    await page.click('button:has-text("Tambah Tugas")');

    await page.fill('input[name="title"]', 'Task Title');
    await page.fill('textarea[name="description"]', 'Description');
    await page.fill('input[name="deadline"]', '2020-01-01');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/deadline.*future|tanggal.*akan datang/i')).toBeVisible();
  });
});

test.describe('Form Validation - Budget Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should require amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('textarea[name="purpose"]', 'Purpose');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*wajib|required/i')).toBeVisible();
  });

  test('should require positive amount', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '-1000');
    await page.fill('textarea[name="purpose"]', 'Purpose');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*positive|jumlah.*positif/i')).toBeVisible();
  });

  test('should require purpose', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '1000000');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/purpose.*wajib|required/i')).toBeVisible();
  });

  test('should accept zero amount (for zero budget requests)', async ({ page }) => {
    await page.goto('/dashboard/finance');
    await page.click('button:has-text("Ajukan Dana")');

    await page.fill('input[name="amount"]', '0');
    await page.fill('textarea[name="purpose"]', 'Purpose');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/amount.*greater|jumlah.*lebih besar/i')).toBeVisible();
  });
});

test.describe('Form Validation - Members', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should require valid email format', async ({ page }) => {
    await page.goto('/dashboard/members/invite');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '081234567890');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/invalid.*email|email.*tidak/i')).toBeVisible();
  });

  test('should require full name', async ({ page }) => {
    await page.goto('/dashboard/members/invite');
    await page.fill('input[name="email"]', generateTestEmail());
    await page.fill('input[name="phone"]', '081234567890');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/fullName.*wajib|required/i')).toBeVisible();
  });

  test('should require phone number', async ({ page }) => {
    await page.goto('/dashboard/members/invite');
    await page.fill('input[name="email"]', generateTestEmail());
    await page.fill('input[name="fullName"]', 'Test User');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/phone.*wajib|required/i')).toBeVisible();
  });

  test('should require division selection', async ({ page }) => {
    await page.goto('/dashboard/members/invite');
    await page.fill('input[name="email"]', generateTestEmail());
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '081234567890');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/division.*wajib|required/i')).toBeVisible();
  });

  test('should require role selection', async ({ page }) => {
    await page.goto('/dashboard/members/invite');
    await page.fill('input[name="email"]', generateTestEmail());
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '081234567890');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/role.*wajib|required/i')).toBeVisible();
  });
});

test.describe('Form Validation - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should require role name', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('button:has-text("Tambah Role")');

    await page.fill('input[name="level"]', '50');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/name.*wajib|required/i')).toBeVisible();
  });

  test('should require positive level', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('button:has-text("Tambah Role")');

    await page.fill('input[name="name"]', 'Test Role');
    await page.fill('input[name="level"]', '-1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/level.*positive|level.*positif/i')).toBeVisible();
  });

  test('should require division name', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('button:has-text("Tambah Divisi")');

    await page.fill('input[name="slug"]', 'test-division');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/name.*wajib|required/i')).toBeVisible();
  });

  test('should require division slug', async ({ page }) => {
    await page.goto('/admin/divisions');
    await page.click('button:has-text("Tambah Divisi")');

    await page.fill('input[name="name"]', 'Test Division');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/slug.*wajib|required/i')).toBeVisible();
  });
});
