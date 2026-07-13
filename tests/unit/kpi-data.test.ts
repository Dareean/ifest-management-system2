import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn() } },
  }),
}));

describe('KPI Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(createMockSupabase({ data: null, error: null }));
  });

  describe('getAllKpisWithTasks', () => {
    it('should return empty array when no KPIs found', async () => {
      const { getAllKpisWithTasks } = await import('@/lib/data/kpi');
      const result = await getAllKpisWithTasks();
      expect(result).toEqual([]);
    });

    it('should return KPIs with tasks', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'kpi_items') {
          return createMockSupabase({
            data: [
              {
                id: 'kpi-1',
                title: 'KPI Satu',
                target: '100%',
                deadline: '2026-12-31',
                is_milestone: true,
                division_id: 'div-1',
                division: { name: 'Divisi A', slug: 'divisi-a' },
              },
            ],
            error: null,
          });
        }
        if (table === 'tasks') {
          return createMockSupabase({
            data: [
              { id: 'task-1', title: 'Task 1', description: 'Desc 1', status: 'done', priority: 'high', deadline: '2026-08-01', completed_at: '2026-07-15T00:00:00Z' },
              { id: 'task-2', title: 'Task 2', description: null, status: 'todo', priority: 'medium', deadline: null, completed_at: null },
            ],
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getAllKpisWithTasks } = await import('@/lib/data/kpi');
      const result = await getAllKpisWithTasks();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('KPI Satu');
      expect(result[0].isMilestone).toBe(true);
      expect(result[0].divisionName).toBe('Divisi A');
      expect(result[0].totalTasks).toBe(2);
      expect(result[0].doneTasks).toBe(1);
      expect(result[0].tasks).toHaveLength(2);
    });
  });

  describe('getDivisionKpiSummaries', () => {
    it('should return empty array when no divisions found', async () => {
      const { getDivisionKpiSummaries } = await import('@/lib/data/kpi');
      const result = await getDivisionKpiSummaries();
      expect(result).toEqual([]);
    });

    it('should return division summaries with KPI and task data', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'divisions') {
          return createMockSupabase({
            data: [
              { id: 'div-1', name: 'Divisi A', slug: 'divisi-a' },
              { id: 'div-2', name: 'Divisi B', slug: 'divisi-b' },
            ],
            error: null,
          });
        }
        if (table === 'kpi_items') {
          return createMockSupabase({
            data: [
              { id: 'kpi-1', is_milestone: true },
              { id: 'kpi-2', is_milestone: false },
            ],
            error: null,
          });
        }
        if (table === 'tasks') {
          return createMockSupabase({
            data: [
              { status: 'done' },
              { status: 'todo' },
              { status: 'done' },
            ],
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getDivisionKpiSummaries } = await import('@/lib/data/kpi');
      const result = await getDivisionKpiSummaries();
      expect(result).toHaveLength(2);
      expect(result[0].divisionName).toBe('Divisi A');
      expect(result[0].totalKpis).toBe(2);
      expect(result[0].milestoneKpis).toBe(1);
      expect(result[0].totalTasks).toBe(3);
      expect(result[0].doneTasks).toBe(2);
    });

    it('should handle division with no KPIs', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'divisions') {
          return createMockSupabase({
            data: [{ id: 'div-1', name: 'Divisi A', slug: 'divisi-a' }],
            error: null,
          });
        }
        if (table === 'kpi_items') {
          return createMockSupabase({ data: [], error: null });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getDivisionKpiSummaries } = await import('@/lib/data/kpi');
      const result = await getDivisionKpiSummaries();
      expect(result[0].totalKpis).toBe(0);
      expect(result[0].totalTasks).toBe(0);
      expect(result[0].doneTasks).toBe(0);
    });
  });
});
