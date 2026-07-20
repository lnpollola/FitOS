export function formatNumber(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function _toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v);
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateShort(v) {
  const d = _toDate(v);
  if (!d) return '—';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function formatDateLong(v) {
  const d = _toDate(v);
  if (!d) return '—';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(v) {
  const d = _toDate(v);
  if (!d) return '—';
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatDateRange(start, end) {
  if (!start && !end) return '—';
  const s = start ? formatDateShort(start) : '...';
  const e = end ? formatDateShort(end) : '...';
  return `${s} - ${e}`;
}

export function formatDuration(minutes) {
  if (minutes == null || isNaN(minutes)) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatKcal(kcal) {
  if (kcal == null || isNaN(kcal)) return '—';
  return formatNumber(kcal, 0) + ' kcal';
}

export function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

export function formatValue(val, decimals = 1) {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
