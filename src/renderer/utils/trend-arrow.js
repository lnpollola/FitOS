export function getTrendArrow(current, previous, options = {}) {
  if (current == null || previous == null) return { arrow: '―', cls: 'trend-flat', label: '' };
  const goodIsUp = options.goodIsUp !== false;
  const threshold = options.threshold || 0;
  const delta = current - previous;
  if (Math.abs(delta) <= threshold) return { arrow: '―', cls: 'trend-flat', label: '' };
  const up = delta > 0;
  const isGood = goodIsUp ? up : !up;
  return {
    arrow: up ? '▲' : '▼',
    cls: isGood ? 'trend-up' : 'trend-down',
    label: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`,
  };
}

export function trendBadge(series, options = {}) {
  if (!series || series.length < 4) return '';
  const nums = series.map(v => (v == null ? 0 : Number(v)));
  const mid = Math.floor(nums.length / 2);
  const firstAvg = nums.slice(0, mid).reduce((s, v) => s + v, 0) / Math.max(1, mid);
  const secondAvg = nums.slice(mid).reduce((s, v) => s + v, 0) / Math.max(1, nums.length - mid);
  if (!firstAvg) return '';
  const pct = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;
  let arrow, cls;
  if (pct > 5) { arrow = '▲'; cls = 'trend-up'; }
  else if (pct < -5) { arrow = '▼'; cls = 'trend-down'; }
  else { arrow = '―'; cls = 'trend-flat'; }
  return `<span class="metric-trend ${cls}" style="font-size:11px;margin-left:6px">${arrow}</span>`;
}
