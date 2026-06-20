import { describe, it, expect } from 'vitest';
import { getSportDisplayName, getMeasurementLabel } from '../../src/renderer/locales/es.js';

describe('getSportDisplayName', () => {
  it('returns Spanish name for known sport', () => {
    expect(getSportDisplayName('running')).toBe('Carrera');
  });

  it('returns Spanish name for cycling', () => {
    expect(getSportDisplayName('cycling')).toBe('Ciclismo');
  });

  it('returns type itself for unknown sport', () => {
    expect(getSportDisplayName('unknown_type')).toBe('unknown_type');
  });

  it('returns fallback for empty type', () => {
    expect(getSportDisplayName('')).toBe('Otro');
  });
});

describe('getMeasurementLabel', () => {
  it('returns Spanish label for chest_cm', () => {
    expect(getMeasurementLabel('chest_cm')).toBe('Pecho');
  });

  it('returns Spanish label for waist_cm', () => {
    expect(getMeasurementLabel('waist_cm')).toBe('Cintura');
  });

  it('returns sanitized key for unknown metric', () => {
    expect(getMeasurementLabel('unknown_metric')).toBe('unknown metric');
  });
});
