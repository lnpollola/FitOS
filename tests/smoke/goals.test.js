import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const baseMockApi = () => ({
  getGoals: () => Promise.resolve([]),
  saveGoal: (goal) => Promise.resolve({ ok: true, goal }),
  deleteGoal: (id) => Promise.resolve({ ok: true }),
  archiveGoal: (id) => Promise.resolve({ ok: true }),
  getGoalProgress: (goalId) => Promise.resolve({ ok: true, current: 0, target: 100, progress_pct: 0 }),
  navigate: () => {},
});

function mountContainer() {
  document.body.innerHTML = `
    <div id="view-goals">
      <h2 class="view-title">Objetivos</h2>
      <div id="goals-toolbar"></div>
      <div id="goals-empty"></div>
      <div id="goals-active"></div>
      <div id="goals-completed"></div>
      <div id="goals-archived"></div>
      <div id="goals-celebration"></div>
      <div id="goals-modal"></div>
      <div id="goals-skeleton"></div>
    </div>
  `;
}

describe('Goals view', () => {
  beforeEach(() => {
    mountContainer();
    window.electronAPI = baseMockApi();
  });

  afterEach(() => {
    delete window.electronAPI;
    document.body.innerHTML = '';
  });

  it('renders empty state when no goals exist', async () => {
    const { init } = await import('../../src/renderer/views/goals.js');
    init();
    await new Promise(r => setTimeout(r, 50));
    const emptyEl = document.getElementById('goals-empty');
    expect(emptyEl).toBeTruthy();
  });

  it('renders empty title text', async () => {
    const { init } = await import('../../src/renderer/views/goals.js');
    init();
    await new Promise(r => setTimeout(r, 50));
    const html = document.getElementById('view-goals').innerHTML;
    expect(html).toMatch(/Aún no tienes objetivos/);
  });

  it('has btn-new-goal button', async () => {
    const { init } = await import('../../src/renderer/views/goals.js');
    init();
    await new Promise(r => setTimeout(r, 50));
    const btn = document.getElementById('btn-new-goal');
    expect(btn).toBeTruthy();
  });

  it('renders active goals when they exist', async () => {
    window.electronAPI.getGoals = () => Promise.resolve([
      { id: '1', type: 'weight', label: 'Bajar a 75 kg', target: 75, current: 80, unit: 'kg', startDate: '2026-06-01', targetDate: '2026-09-15', archived: false, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
    ]);
    const { init } = await import('../../src/renderer/views/goals.js');
    init();
    await new Promise(r => setTimeout(r, 50));
    const goalCards = document.querySelectorAll('.goal-card');
    expect(goalCards.length).toBeGreaterThanOrEqual(1);
  });

  it('renders goal cards with progress rings', async () => {
    window.electronAPI.getGoals = () => Promise.resolve([
      { id: '1', type: 'weight', label: 'Bajar a 75 kg', target: 75, current: 80, unit: 'kg', startDate: '2026-06-01', targetDate: '2026-09-15', archived: false, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
    ]);
    const { init } = await import('../../src/renderer/views/goals.js');
    init();
    await new Promise(r => setTimeout(r, 80));
    const rings = document.querySelectorAll('.goal-card-ring svg');
    expect(rings.length).toBeGreaterThanOrEqual(1);
  });
});
