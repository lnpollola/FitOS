export function growthRing(dailyValues) {
  const N = dailyValues.length;
  if (!N) return '';
  const vals = dailyValues.map(v => (v == null ? 0 : Number(v)));
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const uniform = max === min;
  const span = (max - min) || 1;
  const minR = 24;
  const maxR = 47;
  const Nf = Math.max(1, N - 1);
  const gap = N > 14 ? 0.6 : 0;
  let arcs = '';
  for (let i = 0; i < N; i++) {
    const v = vals[i];
    const t = (v - min) / span;
    const r = minR + (maxR - minR) * (i / Nf);
    const sweep = (360 / N) - gap;
    const startAngle = -90 + (i * 360 / N) + gap / 2;
    const endAngle = startAngle + sweep;
    const x1 = cx + r * Math.cos(startAngle * Math.PI / 180);
    const y1 = cy + r * Math.sin(startAngle * Math.PI / 180);
    const x2 = cx + r * Math.cos(endAngle * Math.PI / 180);
    const y2 = cy + r * Math.sin(endAngle * Math.PI / 180);
    const large = sweep > 180 ? 1 : 0;
    const strokeW = 3 + t * 5;
    const color = uniform ? 'var(--moss-mist)' : t > 0.6 ? 'var(--moss)' : t < 0.25 ? 'var(--ember)' : 'var(--moss-mist)';
    arcs += `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${color}" stroke-width="${strokeW.toFixed(2)}" stroke-linecap="round" fill="none"/>`;
  }
  return `<svg class="hero-ring" viewBox="0 0 ${size} ${size}" aria-hidden="true">${arcs}</svg>`;
}
