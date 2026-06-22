import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  document.documentElement.style.setProperty('--accent', '#0D9488');
  document.documentElement.style.setProperty('--text-secondary', '#64748B');
  document.documentElement.style.setProperty('--text-primary', '#0F172A');
  document.documentElement.style.setProperty('--border', '#E2E8F0');
  document.documentElement.style.setProperty('--warning', '#F59E0B');
  document.documentElement.style.setProperty('--success', '#10B981');
  document.documentElement.style.setProperty('--danger', '#EF4444');
});

describe('chart-theme.js', () => {
  it('returns color object with expected keys', async () => {
    const { chartColors } = await import('../../src/renderer/utils/chart-theme.js');
    expect(chartColors.accent).toBe('#0D9488');
    expect(chartColors.textSecondary).toBe('#64748B');
    expect(chartColors.textPrimary).toBe('#0F172A');
    expect(chartColors.grid).toBe('#E2E8F0');
    expect(chartColors.warning).toBe('#F59E0B');
    expect(chartColors.success).toBe('#10B981');
    expect(chartColors.danger).toBe('#EF4444');
    expect(chartColors.accentHover).toBeDefined();
  });

  it('provides fallback defaults when CSS vars are empty', async () => {
    document.documentElement.style.removeProperty('--accent');
    const { chartColors } = await import('../../src/renderer/utils/chart-theme.js');
    expect(chartColors.accent).toBe('#0D9488');
  });
});

describe('skeleton.js', () => {
  it('skeletonCard returns HTML with skeleton class', async () => {
    const { skeletonCard } = await import('../../src/renderer/utils/skeleton.js');
    const html = skeletonCard();
    expect(html).toContain('skeleton');
    expect(html).toContain('dashboard-card');
  });

  it('skeletonRow returns HTML with skeleton class', async () => {
    const { skeletonRow } = await import('../../src/renderer/utils/skeleton.js');
    const html = skeletonRow(3);
    expect(html).toContain('skeleton');
    expect(html).toContain('card');
  });

  it('skeletonChart returns HTML with skeleton class', async () => {
    const { skeletonChart } = await import('../../src/renderer/utils/skeleton.js');
    const html = skeletonChart();
    expect(html).toContain('skeleton');
    expect(html).toContain('chart-card');
  });
});

describe('state-card.js', () => {
  it('renders loading state correctly', async () => {
    const { renderStateCard } = await import('../../src/renderer/utils/state-card.js');
    const container = document.createElement('div');
    renderStateCard(container, { title: 'Test', state: 'loading' });
    expect(container.innerHTML).toContain('skeleton');
  });

  it('renders error state with role="alert"', async () => {
    const { renderStateCard } = await import('../../src/renderer/utils/state-card.js');
    const container = document.createElement('div');
    renderStateCard(container, { title: 'Test', state: 'error', subtitle: 'Error!', onRetry: () => {} });
    expect(container.innerHTML).toContain('role="alert"');
    expect(container.innerHTML).toContain('Reintentar');
  });

  it('renders empty state with action button', async () => {
    const { renderStateCard } = await import('../../src/renderer/utils/state-card.js');
    const container = document.createElement('div');
    renderStateCard(container, { title: 'Test', state: 'empty', subtitle: 'No data', onRetry: () => {} });
    expect(container.innerHTML).toContain('btn');
    expect(container.innerHTML).toContain('Reintentar');
  });

  it('renders data state', async () => {
    const { renderStateCard } = await import('../../src/renderer/utils/state-card.js');
    const container = document.createElement('div');
    renderStateCard(container, { title: 'Test', state: 'data', valueHtml: '42', subtitle: 'units' });
    expect(container.innerHTML).toContain('42');
    expect(container.innerHTML).toContain('Test');
  });
});

describe('icons.js', () => {
  it('icon() returns SVG string with viewBox and specified size', async () => {
    const { icon } = await import('../../src/renderer/utils/icons.js');
    const svg = icon('check', 16);
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('width="16"');
    expect(svg).toContain('height="16"');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('icon() returns empty string for unknown icon', async () => {
    const { icon } = await import('../../src/renderer/utils/icons.js');
    expect(icon('nonexistent')).toBe('');
  });
});

describe('sport-icons.js', () => {
  it('sportIcon returns SVG for known types', async () => {
    const { sportIcon } = await import('../../src/renderer/utils/sport-icons.js');
    const runSvg = sportIcon('running', 16);
    const cycleSvg = sportIcon('cycling', 16);
    const swimSvg = sportIcon('swimming', 16);
    expect(runSvg).toContain('<svg');
    expect(runSvg).toContain('width="16"');
    expect(cycleSvg).toContain('<svg');
    expect(swimSvg).toContain('<svg');
  });

  it('sportIcon returns fallback for unknown type', async () => {
    const { sportIcon } = await import('../../src/renderer/utils/sport-icons.js');
    const fallback = sportIcon('unknown_sport', 16);
    expect(fallback).toContain('<svg');
  });
});
