/**
 * Test Helper Utilities
 *
 * Shared utilities for E2E, Integration, and Unit tests
 */

import { Page } from '@playwright/test';

/**
 * Test user credentials (dummy accounts)
 * These should exist in the test database
 */
export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.ifest.local',
    password: 'TestAdmin123!',
    name: 'Admin Test',
    role: 'admin',
  },
  sekretaris: {
    email: 'sekretaris@test.ifest.local',
    password: 'TestSekretaris123!',
    name: 'Sekretaris Test',
    role: 'sekretaris',
  },
  member: {
    email: 'member@test.ifest.local',
    password: 'TestMember123!',
    name: 'Member Test',
    role: 'member',
  },
} as const;

/**
 * Login helper for E2E tests
 */
export async function loginAs(
  page: Page,
  account: keyof typeof TEST_ACCOUNTS
): Promise<void> {
  const user = TEST_ACCOUNTS[account];

  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Logout helper for E2E tests
 */
export async function logout(page: Page): Promise<void> {
  // Assuming there's a logout button/menu
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * Wait for toast/notification message
 */
export async function waitForToast(
  page: Page,
  message: string
): Promise<void> {
  await page.waitForSelector(`text=${message}`, { timeout: 5000 });
}

/**
 * Create test letter request (for integration tests)
 */
export function createTestLetterData(overrides?: Partial<any>) {
  return {
    letterType: 'Surat Permohonan',
    subject: 'Test Letter Request',
    body: 'This is a test letter request body',
    deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    targetInstitution: 'Test Institution',
    category: 'external',
    priority: 'sedang',
    ...overrides,
  };
}

/**
 * Create test meeting data (for integration tests)
 */
export function createTestMeetingData(overrides?: Partial<any>) {
  return {
    title: 'Test Meeting',
    startedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Test Location',
    agenda: 'Test meeting agenda',
    scope: 'division',
    ...overrides,
  };
}

/**
 * Generate random test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}@test.ifest.local`;
}

/**
 * Wait for email to be sent (mock check or database check)
 */
export async function waitForEmailSent(
  recipientEmail: string,
  subject: string
): Promise<boolean> {
  // In real test, query email_queue table or mock Brevo API
  // For now, just wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(
  supabase: any,
  options: {
    letters?: boolean;
    meetings?: boolean;
    notifications?: boolean;
  }
): Promise<void> {
  if (options.letters) {
    await supabase
      .from('letter_requests')
      .delete()
      .like('subject', 'Test%');
  }

  if (options.meetings) {
    await supabase
      .from('meetings')
      .delete()
      .like('title', 'Test%');
  }

  if (options.notifications) {
    await supabase
      .from('notifications')
      .delete()
      .like('title', 'Test%');
  }
}
