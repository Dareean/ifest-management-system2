import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();

vi.mock('@/lib/auth/authorize', () => ({
  requireSecretary: vi.fn(),
  requireRole: vi.fn(),
  requirePermission: vi.fn(),
  SECRETARY_SLUGS: ['sekretaris', 'sekretaris-1', 'sekretaris-2', 'sekretaris-umum'],
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } }) } },
  }),
}));

const mockCreateNotification = vi.fn();
const mockNotifyDivision = vi.fn();
vi.mock('@/lib/internal-notifications', () => ({
  createNotification: mockCreateNotification,
  notifyDivision: mockNotifyDivision,
}));

const mockSendEmailNotification = vi.fn();
vi.mock('@/lib/email', () => ({
  sendEmailNotification: mockSendEmailNotification,
}));

describe('Letter Workflow Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(createMockSupabase({ data: null, error: null }));
  });

  describe('startProcessingLetter', () => {
    it('should return error if not authorized as secretary', async () => {
      const { requireSecretary } = await import('@/lib/auth/authorize');
      (requireSecretary as any).mockResolvedValue({ authorized: false, error: 'Akses ditolak' });

      const { startProcessingLetter } = await import('@/lib/actions/letter-workflow');
      const result = await startProcessingLetter('test-id');
      expect(result).toEqual({ error: 'Akses ditolak' });
    });

    it('should process letter and send notifications', async () => {
      const { requireSecretary } = await import('@/lib/auth/authorize');
      (requireSecretary as any).mockResolvedValue({ authorized: true });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'letter_requests') {
          return createMockSupabase({
            data: {
              id: 'letter-1',
              subject: 'Test Letter',
              division_id: 'div-1',
              requester_id: 'assign-1',
            },
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { startProcessingLetter } = await import('@/lib/actions/letter-workflow');
      const result = await startProcessingLetter('letter-1');
      expect(result).toEqual({ success: true });
      expect(mockNotifyDivision).toHaveBeenCalledWith('div-1', 'letter', expect.stringContaining('diproses'), expect.any(String), true);
      expect(mockCreateNotification).toHaveBeenCalledWith('assign-1', 'letter', expect.stringContaining('diproses'), expect.any(String), true);
    });
  });

  describe('completeLetter', () => {
    it('should return error if not authorized as secretary', async () => {
      const { requireSecretary } = await import('@/lib/auth/authorize');
      (requireSecretary as any).mockResolvedValue({ authorized: false, error: 'Akses ditolak' });

      const { completeLetter } = await import('@/lib/actions/letter-workflow');
      const result = await completeLetter('test-id', 'https://drive.google.com/doc');
      expect(result).toEqual({ error: 'Akses ditolak' });
    });

    it('should return error if final document URL is empty', async () => {
      const { requireSecretary } = await import('@/lib/auth/authorize');
      (requireSecretary as any).mockResolvedValue({ authorized: true });

      const { completeLetter } = await import('@/lib/actions/letter-workflow');
      const result = await completeLetter('test-id', '');
      expect(result).toEqual({ error: 'Link Google Drive dokumen final harus diisi.' });
    });

    it('should complete letter and send notifications', async () => {
      const { requireSecretary } = await import('@/lib/auth/authorize');
      (requireSecretary as any).mockResolvedValue({ authorized: true });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'letter_requests') {
          return createMockSupabase({
            data: {
              id: 'letter-1',
              subject: 'Test Letter',
              division_id: 'div-1',
              requester_id: 'assign-1',
            },
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { completeLetter } = await import('@/lib/actions/letter-workflow');
      const result = await completeLetter('letter-1', 'https://drive.google.com/doc');
      expect(result).toEqual({ success: true });
      expect(mockNotifyDivision).toHaveBeenCalledWith('div-1', 'letter', expect.stringContaining('selesai'), expect.any(String), true);
    });
  });

  describe('requestRevision', () => {
    it('should return error if not authorized', async () => {
      const { requireRole } = await import('@/lib/auth/authorize');
      (requireRole as any).mockResolvedValue({ authorized: false, error: 'Akses ditolak' });

      const { requestRevision } = await import('@/lib/actions/letter-workflow');
      const formData = new FormData();
      formData.append('id', 'test-id');
      formData.append('note', 'Please revise');
      const result = await requestRevision(null, formData);
      expect(result).toEqual({ error: 'Akses ditolak' });
    });

    it('should return error when revision note is empty', async () => {
      const { requireRole } = await import('@/lib/auth/authorize');
      (requireRole as any).mockResolvedValue({ authorized: true, session: { assignmentId: 'assign-1' } });

      const { requestRevision } = await import('@/lib/actions/letter-workflow');
      const formData = new FormData();
      formData.append('id', 'test-id');
      formData.append('note', '');
      const result = await requestRevision(null, formData);
      expect(result).toEqual({ error: 'Catatan revisi harus diisi' });
    });

    it('should return error if letter not found', async () => {
      const { requireRole } = await import('@/lib/auth/authorize');
      (requireRole as any).mockResolvedValue({ authorized: true, session: { assignmentId: 'assign-1' } });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'letter_requests') {
          return createMockSupabase({ data: null, error: null });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { requestRevision } = await import('@/lib/actions/letter-workflow');
      const formData = new FormData();
      formData.append('id', 'nonexistent');
      formData.append('note', 'Please revise');
      const result = await requestRevision(null, formData);
      expect(result).toEqual({ error: 'Surat tidak ditemukan' });
    });

    it('should return error if user is not the requester', async () => {
      const { requireRole } = await import('@/lib/auth/authorize');
      (requireRole as any).mockResolvedValue({ authorized: true, session: { assignmentId: 'other-assign' } });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'letter_requests') {
          return createMockSupabase({
            data: { id: 'letter-1', requester_id: 'assign-1', revision_count: 0, committee_year_id: 'year-1', subject: 'Test', division_id: 'div-1' },
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { requestRevision } = await import('@/lib/actions/letter-workflow');
      const formData = new FormData();
      formData.append('id', 'letter-1');
      formData.append('note', 'Please revise');
      const result = await requestRevision(null, formData);
      expect(result).toEqual({ error: 'Akses ditolak. Hanya pengaju surat atau Sekretaris yang dapat mengirim catatan revisi/masukan.' });
    });

    it('should process revision request successfully', async () => {
      const { requireRole } = await import('@/lib/auth/authorize');
      (requireRole as any).mockResolvedValue({ authorized: true, session: { assignmentId: 'assign-1' } });

      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'letter_requests') {
          callCount++;
          if (callCount <= 2) {
            return createMockSupabase({
              data: { id: 'letter-1', requester_id: 'assign-1', revision_count: 0, committee_year_id: 'year-1', subject: 'Test', division_id: 'div-1' },
              error: null,
            });
          }
          return createMockSupabase({ data: null, error: null });
        }
        if (table === 'letter_revisions') {
          return createMockSupabase({ data: null, error: null });
        }
        if (table === 'divisions') {
          return createMockSupabase({ data: { id: 'bph-div' }, error: null });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { requestRevision } = await import('@/lib/actions/letter-workflow');
      const formData = new FormData();
      formData.append('id', 'letter-1');
      formData.append('note', 'Please revise this letter');
      const result = await requestRevision(null, formData);
      expect(result).toEqual({ success: true });
      expect(mockNotifyDivision).toHaveBeenCalled();
    });
  });
});
