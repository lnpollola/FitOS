export function getRangeDates(range) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from;
  if (range === 'year') {
    from = `${now.getFullYear()}-01-01`;
  } else {
    const days = range === '7d' ? 7 : range === '15d' ? 15 : 30;
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    from = d.toISOString().split('T')[0];
  }
  return { from, to };
}
