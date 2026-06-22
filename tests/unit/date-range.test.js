import { describe, it, expect } from 'vitest';

describe('getRangeDates', () => {
  it('returns from/to dates for 15d range', async () => {
    const { getRangeDates } = await import('../../src/renderer/utils/date-range.js');
    const { from, to } = getRangeDates('15d');
    expect(from).toBeTruthy();
    expect(to).toBeTruthy();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeCloseTo(15, -1);
  });

  it('returns from/to dates for 1m range (30 days)', async () => {
    const { getRangeDates } = await import('../../src/renderer/utils/date-range.js');
    const { from, to } = getRangeDates('1m');
    expect(from).toBeTruthy();
    expect(to).toBeTruthy();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeCloseTo(30, -1);
  });

  it('returns from/to dates for 3m range (90 days)', async () => {
    const { getRangeDates } = await import('../../src/renderer/utils/date-range.js');
    const { from, to } = getRangeDates('3m');
    expect(from).toBeTruthy();
    expect(to).toBeTruthy();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeCloseTo(90, -1);
  });
});
