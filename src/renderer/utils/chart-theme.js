function readCSSVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export const chartColors = {
  get accent() { return readCSSVar('--accent', '#0D9488'); },
  get accentHover() { return readCSSVar('--accent-hover', '#0F766E'); },
  get textSecondary() { return readCSSVar('--text-secondary', '#64748B'); },
  get textPrimary() { return readCSSVar('--text-primary', '#0F172A'); },
  get grid() { return readCSSVar('--border', '#E2E8F0'); },
  get warning() { return readCSSVar('--warning', '#F59E0B'); },
  get success() { return readCSSVar('--success', '#10B981'); },
  get danger() { return readCSSVar('--danger', '#EF4444'); },
};

export function chartColorWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
