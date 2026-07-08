import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Goal Progress Directional Calculation', () => {
  let ipcMain, getDb;

  beforeEach(() => {
    ipcMain = { handle: vi.fn() };
    getDb = vi.fn();
    vi.resetModules();
  });

  it('calculates weight loss progress correctly', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValueOnce({ value: JSON.stringify([
          { id: '1', type: 'weight', target: 90, startDate: '2026-01-01', current: 0 }
        ]) }).mockReturnValueOnce({ weight_kg: 95 }).mockReturnValueOnce({ weight_kg: 93 })
      })
    };
    getDb.mockReturnValue(mockDb);

    const { register } = await import('../../src/main/handlers/goals-handlers.js');
    register(ipcMain, getDb);

    const handler = ipcMain.handle.mock.calls.find(c => c[0] === 'db:getGoalProgress')[1];
    const result = await handler(null, '1');

    expect(result.ok).toBe(true);
    expect(result.progress_pct).toBe(40);
    expect(result.current).toBe(93);
    expect(result.target).toBe(90);
  });

  it('calculates weight gain progress correctly', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValueOnce({ value: JSON.stringify([
          { id: '2', type: 'weight', target: 70, startDate: '2026-01-01', current: 0 }
        ]) }).mockReturnValueOnce({ weight_kg: 60 }).mockReturnValueOnce({ weight_kg: 65 })
      })
    };
    getDb.mockReturnValue(mockDb);

    const { register } = await import('../../src/main/handlers/goals-handlers.js');
    register(ipcMain, getDb);

    const handler = ipcMain.handle.mock.calls.find(c => c[0] === 'db:getGoalProgress')[1];
    const result = await handler(null, '2');

    expect(result.ok).toBe(true);
    expect(result.progress_pct).toBe(50);
    expect(result.current).toBe(65);
    expect(result.target).toBe(70);
  });

  it('returns 0% when no starting weight available', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValueOnce({ value: JSON.stringify([
          { id: '3', type: 'weight', target: 85, startDate: '2026-01-01', current: 0 }
        ]) }).mockReturnValueOnce(null).mockReturnValueOnce({ weight_kg: 90 })
      })
    };
    getDb.mockReturnValue(mockDb);

    const { register } = await import('../../src/main/handlers/goals-handlers.js');
    register(ipcMain, getDb);

    const handler = ipcMain.handle.mock.calls.find(c => c[0] === 'db:getGoalProgress')[1];
    const result = await handler(null, '3');

    expect(result.ok).toBe(true);
    expect(result.progress_pct).toBe(0);
    expect(result.note).toBe('Sin datos de peso iniciales');
  });

  it('calculates distance progress correctly (unchanged)', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValueOnce({ value: JSON.stringify([
          { id: '4', type: 'distance', target: 100, startDate: '2026-01-01', current: 0 }
        ]) }),
        all: vi.fn().mockReturnValue([])
      })
    };
    getDb.mockReturnValue(mockDb);

    const { register } = await import('../../src/main/handlers/goals-handlers.js');
    register(ipcMain, getDb);

    const handler = ipcMain.handle.mock.calls.find(c => c[0] === 'db:getGoalProgress')[1];
    const result = await handler(null, '4');

    expect(result.ok).toBe(true);
    expect(result.progress_pct).toBe(0);
  });

  it('calculates frequency progress correctly (unchanged)', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValueOnce({ value: JSON.stringify([
          { id: '5', type: 'frequency', target: 4, startDate: '2026-01-01', current: 0 }
        ]) })
      })
    };
    getDb.mockReturnValue(mockDb);

    const { register } = await import('../../src/main/handlers/goals-handlers.js');
    register(ipcMain, getDb);

    const handler = ipcMain.handle.mock.calls.find(c => c[0] === 'db:getGoalProgress')[1];
    const result = await handler(null, '5');

    expect(result.ok).toBe(true);
  });
});
