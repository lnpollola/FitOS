import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('strengthInsightsPanels module loads', () => {
  beforeEach(() => {
    window.electronAPI = {
      getStrengthPersonalRecords: vi.fn(),
      getStrengthPlateau: vi.fn(),
      getStrengthScore: vi.fn(),
      getWeeklyTonnage: vi.fn(),
      navigate: vi.fn(),
    };
  });

  it('mountStrengthPRs can be imported and called', async () => {
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    expect(mod.mountStrengthPRs).toBeTypeOf('function');
    expect(mod.mountStrengthPlateaus).toBeTypeOf('function');
    expect(mod.mountStrengthScore).toBeTypeOf('function');
    expect(mod.mountWeeklyTonnage).toBeTypeOf('function');
  });

  it('mountStrengthPRs renders with mock data', async () => {
    window.electronAPI.getStrengthPersonalRecords = vi.fn().mockResolvedValue({
      exercises: [{ exercise_id: 1, exercise_name: 'Press Banca', muscle_group: 'Pecho', best_1rm: 80, best_1rm_date: '2026-01-15', prs: [{ estimated_1rm: 80, date: '2026-01-15', rank: 1 }], total_sets: 10 }],
      volumePRs: [{ session_id: 1, date: '2026-01-15', volume_kg: 3000, set_count: 15, exercise_count: 5, rank: 1 }],
      muscleGroups: ['Pecho'],
    });
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountStrengthPRs(container);
    // wait for async
    await new Promise(r => setTimeout(r, 50));
    expect(container.innerHTML).toContain('Press Banca');
    expect(container.innerHTML).toContain('kg');
  });

  it('mountStrengthPlateaus renders with mock data', async () => {
    window.electronAPI.getStrengthPlateau = vi.fn().mockResolvedValue([
      { exercise_id: 1, exercise_name: 'Press Banca', muscle_group: 'Pecho', current_pr_1rm: 80, current_pr_date: '2025-12-01', weeks_since_pr: 12, severity: 'critical', total_sets_since_pr: 20 },
    ]);
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountStrengthPlateaus(container);
    await new Promise(r => setTimeout(r, 50));
    expect(container.innerHTML).toContain('Press Banca');
    expect(container.innerHTML).toContain('critical');
  });

  it('mountStrengthScore renders with mock data', async () => {
    window.electronAPI.getStrengthScore = vi.fn().mockResolvedValue({
      muscle_groups: [{ muscle_group: 'Pecho', score: 80, exercise_count: 2, top_exercise: 'Press Banca' }, { muscle_group: 'Pierna', score: 140, exercise_count: 3, top_exercise: 'Sentadilla' }, { muscle_group: 'Espalda', score: 90, exercise_count: 2, top_exercise: 'Remo' }],
      composite_score: 103,
      insufficient_muscle_groups: false,
      body_weight_kg: 75,
      total_muscle_groups: 3,
    });
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountStrengthScore(container);
    await new Promise(r => setTimeout(r, 50));
    expect(container.innerHTML).toContain('103');
    expect(container.innerHTML).toContain('Press Banca');
  });

  it('mountWeeklyTonnage renders with mock data', async () => {
    window.electronAPI.getWeeklyTonnage = vi.fn().mockResolvedValue({
      weeks: [
        { week: '2026-W01', tonnage_kg: 5000, session_count: 3 },
        { week: '2026-W02', tonnage_kg: 6200, session_count: 4 },
        { week: '2026-W03', tonnage_kg: 5800, session_count: 3 },
        { week: '2026-W04', tonnage_kg: 7000, session_count: 5 },
      ],
      current_12w_total: 24000,
      previous_12w_total: 20000,
      delta_kg: 4000,
      delta_pct: 20,
      direction: 'up',
    });
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountWeeklyTonnage(container);
    await new Promise(r => setTimeout(r, 100));
    expect(container.innerHTML).toContain('24.000');
  });

  it('mountStrengthPRs shows empty state', async () => {
    window.electronAPI.getStrengthPersonalRecords = vi.fn().mockResolvedValue({ exercises: [], volumePRs: [], muscleGroups: [] });
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountStrengthPRs(container);
    await new Promise(r => setTimeout(r, 50));
    expect(container.innerHTML).toContain('Registra');
  });

  it('mountStrengthPlateaus shows empty state', async () => {
    window.electronAPI.getStrengthPlateau = vi.fn().mockResolvedValue([]);
    const mod = await import('../../src/renderer/views/panels/strength-insights-panels.js');
    const container = document.createElement('div');
    mod.mountStrengthPlateaus(container);
    await new Promise(r => setTimeout(r, 50));
    expect(container.innerHTML).toContain('Sin mesetas');
  });
});
