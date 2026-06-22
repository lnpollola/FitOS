export function sparkline(values, { stroke = 'var(--moss)', width = 120, height = 36 } = {}) {
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
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path class="area" d="${areaD}" style="fill:${stroke}"/>
    <path class="line" d="${d}" style="stroke:${stroke}"/>
    <circle class="dot" cx="${last[0].toFixed(2)}" cy="${last[1].toFixed(2)}" r="2.4"/>
  </svg>`;
}
