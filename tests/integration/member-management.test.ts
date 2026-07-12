import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Integration Tests for Member Management Workflow
 *
 * Tests member invitation and management with real test database
 */

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
let testAssignmentIds: string[] = [];
let testUserIds: string[] = [];

describe('Member Management Integration', () => {
  const supabase = createAdminClient();

  beforeEach(async () => {
    testAssignmentIds = [];
    testUserIds = [];
  });

  afterEach(async () => {
    // Cleanup test data
    if (testAssignmentIds.length > 0) {
      await supabase.from('committee_assignments').delete().in('id', testAssignmentIds);
    }
    if (testUserIds.length > 0) {
      await supabase.auth.admin.deleteUser(testUserIds[0]);
    }
  });

  it('should list all active members', async () => {
    const { data: assignments } = await supabase
      .from('committee_assignments')
      .select('id, division_id, user:profiles(full_name)')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true);

    expect(assignments).toBeTruthy();
    expect(assignments!.length).toBeGreaterThan(0);
  });

  it('should get members grouped by division', async () => {
    const { data: divisions } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('committee_year_id', YEAR_ID);

    expect(divisions).toBeTruthy();
    expect(divisions!.length).toBeGreaterThan(0);

    const { data: assignments } = await supabase
      .from('committee_assignments')
      .select('id, division_id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true);

    const grouped = assignments!.reduce((acc, curr) => {
      if (!acc[curr.division_id]) {
        acc[curr.division_id] = [];
      }
      acc[curr.division_id].push(curr.id);
      return acc;
    }, {} as Record<string, string[]>);

    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });

  it('should deactivate member assignment', async () => {
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    expect(assignment).toBeTruthy();

    const { error } = await supabase
      .from('committee_assignments')
      .update({ is_active: false })
      .eq('id', assignment!.id);

    expect(error).toBeNull();

    const { data: updated } = await supabase
      .from('committee_assignments')
      .select('is_active')
      .eq('id', assignment!.id)
      .single();

    expect(updated!.is_active).toBe(false);

    // Restore for cleanup
    await supabase
      .from('committee_assignments')
      .update({ is_active: true })
      .eq('id', assignment!.id);
  });

  it('should get BPH members (high-level roles)', async () => {
    const { data: bphMembers } = await supabase
      .from('committee_assignments')
      .select('id, role:roles!inner(name, level)')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .gte('role.level', 75);

    expect(bphMembers).toBeTruthy();
    if (bphMembers && bphMembers.length > 0) {
      expect((bphMembers[0] as any).role.level).toBeGreaterThanOrEqual(75);
    }
  });

  it('should get division members', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: members } = await supabase
      .from('committee_assignments')
      .select('id, user:profiles(full_name)')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true);

    expect(members).toBeTruthy();
    expect(members!.length).toBeGreaterThanOrEqual(0);
  });

  it('should count total active members', async () => {
    const { count } = await supabase
      .from('committee_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true);

    expect(count).toBeTruthy();
    expect(count!).toBeGreaterThan(0);
  });

  it('should verify member has valid role and division', async () => {
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id, role_id, division_id, role:roles(name), division:divisions(name)')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    expect(assignment).toBeTruthy();
    expect(assignment!.role_id).toBeTruthy();
    expect(assignment!.division_id).toBeTruthy();
    expect((assignment as any).role).toBeTruthy();
    expect((assignment as any).division).toBeTruthy();
  });
});
