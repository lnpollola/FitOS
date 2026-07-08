import { describe, it, expect } from 'vitest';
import { aggregateToWeekly, aggregateToMonthly, getAggregatedData } from '../../src/renderer/utils/period-aggregation.js';

describe('Period Aggregation Utilities', () => {
  const dailyData = [
    { date: '2026-01-05', steps: 8000, kcal_activas: 400, kcal_basales: 1800 },
    { date: '2026-01-06', steps: 7500, kcal_activas: 380, kcal_basales: 1750 },
    { date: '2026-01-07', steps: 9000, kcal_activas: 450, kcal_basales: 1820 },
    { date: '2026-01-08', steps: 6000, kcal_activas: 300, kcal_basales: 1700 },
    { date: '2026-01-09', steps: 8500, kcal_activas: 420, kcal_basales: 1780 },
    { date: '2026-01-10', steps: 7000, kcal_activas: 350, kcal_basales: 1720 },
    { date: '2026-01-11', steps: 9500, kcal_activas: 480, kcal_basales: 1850 },
    { date: '2026-01-12', steps: 8200, kcal_activas: 410, kcal_basales: 1790 },
    { date: '2026-01-13', steps: 7800, kcal_activas: 390, kcal_basales: 1760 },
    { date: '2026-01-14', steps: 8800, kcal_activas: 440, kcal_basales: 1810 },
  ];

  describe('aggregateToWeekly', () => {
    it('aggregates daily data into weekly buckets', () => {
      const weekly = aggregateToWeekly(dailyData, 'steps', 'sum');
      expect(weekly.length).toBeGreaterThan(0);
      expect(weekly[0]).toHaveProperty('date');
      expect(weekly[0]).toHaveProperty('label');
      expect(weekly[0]).toHaveProperty('value');
    });

    it('sums values by default', () => {
      const weekly = aggregateToWeekly(dailyData.slice(0, 7), 'steps', 'sum');
      const expectedSum = dailyData.slice(0, 7).reduce((sum, d) => sum + d.steps, 0);
      expect(weekly[0].value).toBe(expectedSum);
    });

    it('averages values when specified', () => {
      const weekly = aggregateToWeekly(dailyData.slice(0, 7), 'steps', 'avg');
      const expectedAvg = dailyData.slice(0, 7).reduce((sum, d) => sum + d.steps, 0) / 7;
      expect(weekly[0].value).toBeCloseTo(expectedAvg, 1);
    });

    it('returns empty array for empty input', () => {
      expect(aggregateToWeekly([], 'steps', 'sum')).toEqual([]);
      expect(aggregateToWeekly(null, 'steps', 'sum')).toEqual([]);
    });

    it('sorts results by date', () => {
      const weekly = aggregateToWeekly(dailyData, 'steps', 'sum');
      for (let i = 1; i < weekly.length; i++) {
        expect(new Date(weekly[i].date).getTime()).toBeGreaterThan(new Date(weekly[i-1].date).getTime());
      }
    });
  });

  describe('aggregateToMonthly', () => {
    it('aggregates daily data into monthly buckets', () => {
      const monthly = aggregateToMonthly(dailyData, 'steps', 'sum');
      expect(monthly.length).toBeGreaterThan(0);
      expect(monthly[0]).toHaveProperty('date');
      expect(monthly[0]).toHaveProperty('label');
      expect(monthly[0]).toHaveProperty('value');
    });

    it('uses Spanish month abbreviations', () => {
      const monthly = aggregateToMonthly(dailyData, 'steps', 'sum');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      expect(monthNames).toContain(monthly[0].label);
    });

    it('returns empty array for empty input', () => {
      expect(aggregateToMonthly([], 'steps', 'sum')).toEqual([]);
      expect(aggregateToMonthly(null, 'steps', 'sum')).toEqual([]);
    });
  });

  describe('getAggregatedData', () => {
    it('returns daily data for 7d period', () => {
      const result = getAggregatedData(dailyData, '7d', 'steps', 'sum');
      expect(result.length).toBe(dailyData.length);
      expect(result[0]).toHaveProperty('label');
    });

    it('returns weekly data for 1m period', () => {
      const result = getAggregatedData(dailyData, '1m', 'steps', 'sum');
      expect(result.length).toBeLessThan(dailyData.length);
      expect(result[0].label).toMatch(/Sem \d+/);
    });

    it('returns monthly data for 3m period', () => {
      const result = getAggregatedData(dailyData, '3m', 'steps', 'sum');
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array for empty input', () => {
      expect(getAggregatedData([], '7d', 'steps', 'sum')).toEqual([]);
      expect(getAggregatedData(null, '1m', 'steps', 'sum')).toEqual([]);
    });

    it('handles different value keys', () => {
      const stepsResult = getAggregatedData(dailyData, '7d', 'steps', 'sum');
      const kcalResult = getAggregatedData(dailyData, '7d', 'kcal_activas', 'sum');
      expect(stepsResult[0].value).not.toBe(kcalResult[0].value);
    });
  });
});
