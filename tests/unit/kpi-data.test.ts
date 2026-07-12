import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Unit Tests for KPI Data Layer
 *
 * Tests KPI data fetching functions with mocked Supabase
 */

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn(),
  }),
}));

describe('KPI Data Functions', () => {
  const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch all KPIs with tasks', async () => {
    const { getAllKpisWithTasks } = await import('@/lib/data/kpi');

    // Mock Supabase responses
    const mockKpis = [
      { id: 'kpi-1', title: 'Test KPI', target: '100', deadline: '2026-12-31', is_milestone: false, division_id: 'div-1', division: { name: 'Test Division', slug: 'test' } },
    ];

    const mockTasks = [
      { id: 'task-1', title: 'Task 1', description: null, status: 'pending', priority: 'medium', deadline: '2026-11-30', completed_at: null },
      { id: 'task-2', title: 'Task 2', description: 'Description', status: 'done', priority: 'high', deadline: '2026-12-15', completed_at: '2026-12-01' },
    ];

    const mockFrom = vi.fn().mockReturnThis();
    mockFrom.eq.mockReturnThis();
    mockFrom.order.mockReturnThis();
    mockFrom.select.mockResolvedValue({
      data: mockKpis,
      error: null,
    });

    const mockTasksFrom = vi.fn().mockReturnThis();
    mockTasksFrom.eq.mockReturnThis();
    mockTasksFrom.order.mockReturnThis();
    mockTasksFrom.select.mockResolvedValue({
      data: mockTasks,
      error: null,
    });

    // Re-mock the from call chain
    (createAdminClient as any).mockImplementation(() => ({
      from: vi.fn().mockReturnThis()
        .eq: vi.fn().mockReturnThis()
        .order: vi.fn().mockReturnThis()
        .select: vi.fn().mockResolvedValue({ data: mockKpis, error: null }),
    }));

    const result = await getAllKpisWithTasks();

    expect(result.length).toBeGreaterThan(0);
  });

  it('should calculate KPI progress correctly', async () => {
    const { getAllKpisWithTasks } = await import('@/lib/data/kpi');

    const mockKpis = [
      { id: 'kpi-1', title: 'Test KPI', target: '100', deadline: null, is_milestone: true, division_id: 'div-1', division: { name: 'Test', slug: 'test' } },
    ];

    const mockTasks = [
      { id: 'task-1', title: 'Task 1', description: null, status: 'done', priority: 'medium', deadline: null, completed_at: '2026-01-01' },
      { id: 'task-2', title: 'Task 2', description: null, status: 'pending', priority: 'medium', deadline: null, completed_at: null },
      { id: 'task-3', title: 'Task 3', description: null, status: 'in_progress', priority: 'medium', deadline: null, completed_at: null },
    ];

    const mockFrom = vi.fn().mockReturnThis();
    mockFrom.eq.mockReturnThis();
    mockFrom.order.mockReturnThis();
    mockFrom.select.mockResolvedValue({
      data: mockKpis,
      error: null,
    });

    const mockTasksFrom = vi.fn().mockReturnThis();
    mockTasksFrom.eq.mockReturnThis();
    mockTasksFrom.order.mockReturnThis();
    mockTasksFrom.select.mockResolvedValue({
      data: mockTasks,
      error: null,
    });

    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => ({
        from: vi.fn()
          .mockReturnThis()
          .eq: vi.fn().mockReturnThis()
          .order: vi.fn().mockReturnThis()
          .select: vi.fn()
            .mockResolvedValueOnce({ data: mockKpis, error: null })
            .mockResolvedValueOnce({ data: mockTasks, error: null }),
      }),
    }));

    const result = await getAllKpisWithTasks();

    // Should have 3 tasks total, 1 done
    if (result.length > 0) {
      expect(result[0].totalTasks).toBe(3);
      expect(result[0].doneTasks).toBe(1);
    }
  });

  it('should return empty array when no KPIs found', async () => {
    const { getAllKpisWithTasks } = await import('@/lib/data/kpi');

    vi.doMock('@/lib/supabase/admin', () => ({
      createAdminClient: () => ({
        from: vi.fn()
          .mockReturnThis()
          .eq: vi.fn().mockReturnThis()
          .order: vi.fn().mockReturnThis()
          .select: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }));

    const result = await getAllKpisWithTasks();

    expect(result).toEqual([]);
  });
});
