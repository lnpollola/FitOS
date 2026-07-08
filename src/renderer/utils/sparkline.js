const TREND_THRESHOLDS = {
  sleep: 0.02,
  hrv: 0.1,
  rhr: 0.05,
  weight: 0.01,
  steps: 50,
  calories: 10,
  distance: 0.05,
  exercise: 0.5,
  default: 0.05,
};

const INVERSE_METRICS = new Set(['rhr', 'weight']);

export function computeTrendDirection(series, metricType = 'default') {
  if (!series || series.length < 5) return 'lichen';
  const nums = series.map(v => (v == null ? 0 : Number(v))).filter(v => !isNaN(v));
  if (nums.length < 5) return 'lichen';

  const n = nums.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((a, v) => a + v, 0);
  const sumY = nums.reduce((a, v) => a + v, 0);
  const sumXY = indices.reduce((a, x, i) => a + x * nums[i], 0);
  const sumX2 = indices.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  let adjustedSlope = slope;
  if (INVERSE_METRICS.has(metricType)) {
    adjustedSlope = -slope;
  }

  const threshold = TREND_THRESHOLDS[metricType] || TREND_THRESHOLDS.default;
  if (adjustedSlope > threshold) return 'moss';
  if (adjustedSlope < -threshold) return 'ember';
  return 'lichen';
}

export function sparkline(values, { stroke = 'var(--moss)', width = 120, height = 36, showMean = false } = {}) {
  if (!values || values.length < 2) return '';
  const nums = values.map(v => (v == null ? 0 : Number(v)));
  if (nums.length < 2) return '';
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = (max - min) || 1;
  const pad = 2;
  const w = width;
  const h = height;
  const innerH = h - pad * 2;
  const stepX = (w - pad * 2) / (nums.length - 1);
  const pts = nums.map((v, i) => [pad + i * stepX, pad + innerH - ((v - min) / span) * innerH]);
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  const areaD = `${d} L ${pts[pts.length - 1][0].toFixed(2)} ${(h - pad).toFixed(2)} L ${pts[0][0].toFixed(2)} ${(h - pad).toFixed(2)} Z`;
  const last = pts[pts.length - 1];
  const meanY = pad + innerH - ((nums.reduce((a, v) => a + v, 0) / nums.length - min) / span) * innerH;

  let extras = '';
  if (showMean && nums.length >= 3) {
    extras += `<line x1="${pad}" y1="${meanY.toFixed(2)}" x2="${(w - pad).toFixed(2)}" y2="${meanY.toFixed(2)}" stroke="var(--lichen)" stroke-opacity="0.4" stroke-dasharray="2,2" stroke-width="0.8"/>`;
  }

  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" title="Min: ${min} | Max: ${max}">
    <path class="area" d="${areaD}" style="fill:${stroke}"/>
    <path class="line" d="${d}" style="stroke:${stroke}"/>
    ${extras}
    <circle class="dot" cx="${last[0].toFixed(2)}" cy="${last[1].toFixed(2)}" r="2.4"/>
  </svg>`;
}
