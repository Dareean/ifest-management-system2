import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Integration Tests for KPI Workflow
 *
 * Tests KPI and task management with real test database
 */

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
let testKpiIds: string[] = [];
let testTaskIds: string[] = [];

describe('KPI Workflow Integration', () => {
  const supabase = createAdminClient();

  beforeEach(async () => {
    testKpiIds = [];
    testTaskIds = [];
  });

  afterEach(async () => {
    // Cleanup test data
    if (testTaskIds.length > 0) {
      await supabase.from('tasks').delete().in('id', testTaskIds);
    }
    if (testKpiIds.length > 0) {
      await supabase.from('kpi_items').delete().in('id', testKpiIds);
    }
  });

  it('should create KPI item and insert to database', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    expect(division).toBeTruthy();

    const { data: kpi, error } = await supabase
      .from('kpi_items')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test KPI Integration',
        target: 'Complete 100% of planned tasks',
        deadline: '2026-12-31',
        is_milestone: false,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(kpi).toBeTruthy();
    expect(kpi!.title).toBe('Test KPI Integration');

    testKpiIds.push(kpi!.id);
  });

  it('should create task linked to KPI', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: kpi } = await supabase
      .from('kpi_items')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test KPI for Tasks',
        target: 'Test target',
        is_milestone: false,
      })
      .select()
      .single();

    testKpiIds.push(kpi!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        kpi_item_id: kpi!.id,
        assignee_id: assignment!.id,
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test Task',
        description: 'Test task description',
        status: 'pending',
        priority: 'medium',
        deadline: '2026-08-31',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(task).toBeTruthy();
    expect(task!.kpi_item_id).toBe(kpi!.id);

    testTaskIds.push(task!.id);
  });

  it('should update task status', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: kpi } = await supabase
      .from('kpi_items')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test KPI Status',
        target: 'Test',
        is_milestone: false,
      })
      .select()
      .single();

    testKpiIds.push(kpi!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: task } = await supabase
      .from('tasks')
      .insert({
        kpi_item_id: kpi!.id,
        assignee_id: assignment!.id,
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test Task Status Update',
        status: 'pending',
        priority: 'medium',
      })
      .select()
      .single();

    testTaskIds.push(task!.id);

    // Update status to in_progress
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', task!.id);

    expect(updateError).toBeNull();

    // Verify status updated
    const { data: updatedTask } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', task!.id)
      .single();

    expect(updatedTask!.status).toBe('in_progress');
  });

  it('should mark task as done and set completed_at', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: kpi } = await supabase
      .from('kpi_items')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test KPI Completion',
        target: 'Test',
        is_milestone: false,
      })
      .select()
      .single();

    testKpiIds.push(kpi!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: task } = await supabase
      .from('tasks')
      .insert({
        kpi_item_id: kpi!.id,
        assignee_id: assignment!.id,
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test Task Completion',
        status: 'in_progress',
        priority: 'medium',
      })
      .select()
      .single();

    testTaskIds.push(task!.id);

    // Mark as done
    const completedAt = new Date().toISOString();
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: completedAt })
      .eq('id', task!.id);

    expect(error).toBeNull();

    // Verify completion
    const { data: completedTask } = await supabase
      .from('tasks')
      .select('status, completed_at')
      .eq('id', task!.id)
      .single();

    expect(completedTask!.status).toBe('done');
    expect(completedTask!.completed_at).toBeTruthy();
  });

  it('should calculate KPI progress based on task completion', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: kpi } = await supabase
      .from('kpi_items')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        title: 'Test KPI Progress',
        target: 'Complete all tasks',
        is_milestone: false,
      })
      .select()
      .single();

    testKpiIds.push(kpi!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    // Create 3 tasks
    const tasksData = [
      { title: 'Task 1', status: 'done' },
      { title: 'Task 2', status: 'done' },
      { title: 'Task 3', status: 'pending' },
    ];

    for (const taskData of tasksData) {
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          kpi_item_id: kpi!.id,
          assignee_id: assignment!.id,
          committee_year_id: YEAR_ID,
          division_id: division!.id,
          title: taskData.title,
          status: taskData.status,
          priority: 'medium',
        })
        .select()
        .single();
      testTaskIds.push(task!.id);
    }

    // Get all tasks for this KPI
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('kpi_item_id', kpi!.id);

    expect(tasks).toBeTruthy();
    expect(tasks!.length).toBe(3);

    const doneTasks = tasks!.filter((t) => t.status === 'done').length;
    const progress = Math.round((doneTasks / tasks!.length) * 100);

    expect(progress).toBe(67); // 2 out of 3 = 66.67% rounded to 67
  });
});
