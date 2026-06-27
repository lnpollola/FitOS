export function goalProgressRing(progressPct, options = {}) {
  const {
    size = 72,
    strokeWidth = 8,
    trackColor = 'var(--text-secondary)',
    fillColor = 'var(--success)',
    overshootColor = 'var(--accent)',
  } = options;

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progressPct));
  const offset = circumference - (clamped / 100) * circumference;
  const color = progressPct > 100 ? overshootColor : fillColor;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${clamped}% completado">
    <circle
      cx="${center}" cy="${center}" r="${radius}"
      fill="none"
      stroke="${trackColor}"
      stroke-width="${strokeWidth}"
      opacity="0.2"
    />
    <circle
      cx="${center}" cy="${center}" r="${radius}"
      fill="none"
      stroke="${color}"
      stroke-width="${strokeWidth}"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${offset}"
      stroke-linecap="round"
      transform="rotate(-90 ${center} ${center})"
    />
    <text
      x="${center}" y="${center}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="Fraunces, serif"
      font-size="${Math.round(size * 0.25)}"
      fill="var(--text-primary)"
    >${clamped}%</text>
  </svg>`;
}
