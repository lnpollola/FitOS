import { describe, it, expect } from 'vitest';

describe('goalProgressRing', () => {
  it('returns SVG for 0% progress', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(0);
    expect(result).toBeTruthy();
    expect(result).toContain('<svg');
    expect(result).toContain('0%');
  });

  it('returns SVG for 75% progress with correct arc', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(75);
    expect(result).toContain('stroke-dashoffset');
    expect(result).toContain('75%');
  });

  it('renders 100% as full circle', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(100);
    expect(result).toContain('100%');
    expect(result).toContain('var(--success)');
  });

  it('renders overshoot with accent color', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(120);
    expect(result).toContain('100%');
    expect(result).toContain('var(--accent)');
  });

  it('accepts custom size option', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(50, { size: 56 });
    expect(result).toContain('width="56"');
    expect(result).toContain('height="56"');
  });

  it('includes aria-label with percentage', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(33);
    expect(result).toContain('aria-label="33% completado"');
  });

  it('handles 0% as empty ring', async () => {
    const { goalProgressRing } = await import('../../src/renderer/utils/goal-progress-ring.js');
    const result = goalProgressRing(0);
    expect(result).toContain('0%');
    const circles = result.match(/<circle/g);
    expect(circles).toHaveLength(2);
  });
});
