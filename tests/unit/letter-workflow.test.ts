import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit Tests for Letter Workflow
 *
 * Tests letter workflow server actions with mocked dependencies
 */

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn(),
    auth: {
      admin: {
        getUserById: vi.fn(),
      },
    },
  }),
}));

vi.mock('@/lib/internal-notifications', () => ({
  createNotification: vi.fn(),
  notifyDivision: vi.fn(),
}));

describe('Letter Workflow Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start processing letter', async () => {
    // Test startProcessingLetter function
    const { startProcessingLetter } = await import('@/lib/actions/letter-workflow');

    const result = await startProcessingLetter('test-letter-id');

    expect(result).toEqual({ success: true });
  });

  it('should complete letter with document URL', async () => {
    const { completeLetter } = await import('@/lib/actions/letter-workflow');

    const result = await completeLetter('test-letter-id', 'https://drive.google.com/doc');

    expect(result).toEqual({ success: true });
  });

  it('should request letter revision', async () => {
    const { requestRevision } = await import('@/lib/actions/letter-workflow');

    // Mock form data
    const formData = new FormData();
    formData.append('id', 'test-letter-id');
    formData.append('note', 'Please revise this letter');

    const result = await requestRevision(null, formData);

    expect(result).toEqual({ success: true });
  });

  it('should validate revision note is not empty', async () => {
    const { requestRevision } = await import('@/lib/actions/letter-workflow');

    const formData = new FormData();
    formData.append('id', 'test-letter-id');
    formData.append('note', '');

    const result = await requestRevision(null, formData);

    expect(result).toEqual({ error: 'Catatan revisi harus diisi' });
  });
});
