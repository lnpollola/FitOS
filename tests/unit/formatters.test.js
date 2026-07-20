import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatDateRange,
  formatDuration,
  formatKcal,
  escapeHtml,
  formatValue,
} from '../../src/renderer/utils/formatters.js';

describe('formatNumber', () => {
  it('formats normal numbers', () => {
    const r = formatNumber(1234);
    expect(typeof r).toBe('string');
    expect(r).not.toContain('NaN');
    const r2 = formatNumber(1234.5, 2);
    expect(r2).toContain(',');
  });

  it('returns em dash for null/undefined/NaN', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });

  it('formats with decimals', () => {
    const r = formatNumber(3.14159, 2);
    expect(r).toContain(',');
    expect(formatNumber(3, 0)).toBe('3');
  });
});

describe('formatDateShort', () => {
  it('formats a date string', () => {
    const result = formatDateShort('2024-01-15');
    expect(result).toContain('15');
    expect(result).toContain('ene');
  });

  it('formats a Date object', () => {
    const result = formatDateShort(new Date('2024-06-15'));
    expect(result).toContain('15');
    expect(result).toContain('jun');
  });

  it('returns em dash for null/undefined', () => {
    expect(formatDateShort(null)).toBe('—');
    expect(formatDateShort(undefined)).toBe('—');
    expect(formatDateShort('')).toBe('—');
  });

  it('returns em dash for invalid date', () => {
    expect(formatDateShort('not-a-date')).toBe('—');
  });
});

describe('formatDateLong', () => {
  it('formats a date string with weekday', () => {
    const result = formatDateLong('2024-01-15');
    expect(result).toContain('lunes');
    expect(result).toContain('enero');
  });

  it('returns em dash for null/undefined', () => {
    expect(formatDateLong(null)).toBe('—');
    expect(formatDateLong(undefined)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const result = formatDateTime('2024-01-15T10:30:00');
    expect(result).toContain('15');
    expect(result).toContain('ene');
    expect(result).toContain('10:30');
  });

  it('formats Date objects', () => {
    const result = formatDateTime(new Date('2024-06-15T14:30:00'));
    expect(result).toContain('14:30');
  });

  it('returns em dash for null', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});

describe('formatDateRange', () => {
  it('formats both dates', () => {
    const result = formatDateRange('2024-01-15', '2024-02-20');
    expect(result).toContain('15');
    expect(result).toContain('feb');
    expect(result).toContain('-');
  });

  it('handles missing start', () => {
    const result = formatDateRange(null, '2024-01-15');
    expect(result).toContain('...');
  });

  it('returns em dash when both missing', () => {
    expect(formatDateRange(null, null)).toBe('—');
    expect(formatDateRange()).toBe('—');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30 min');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('returns em dash for null/NaN', () => {
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(NaN)).toBe('—');
    expect(formatDuration(undefined)).toBe('—');
  });
});

describe('formatKcal', () => {
  it('appends kcal suffix', () => {
    const r = formatKcal(1500);
    expect(r).toContain('kcal');
    expect(r).not.toContain('NaN');
    expect(r).not.toContain('null');
  });

  it('returns em dash for null/NaN', () => {
    expect(formatKcal(null)).toBe('—');
    expect(formatKcal(NaN)).toBe('—');
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special chars', () => {
    const r = escapeHtml('<script>alert("x")</script>');
    expect(r).toContain('&lt;');
    expect(r).toContain('&gt;');
    expect(r).not.toContain('<script>');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('handles normal strings', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('formatValue', () => {
  it('formats with 1 decimal by default', () => {
    expect(formatValue(3.5)).toBe('3,5');
    expect(formatValue(3.14159)).toBe('3,1');
  });

  it('uses custom decimals', () => {
    expect(formatValue(3.14159, 3)).toBe('3,142');
  });

  it('returns em dash for null/NaN', () => {
    expect(formatValue(null)).toBe('—');
    expect(formatValue(NaN)).toBe('—');
  });
});
