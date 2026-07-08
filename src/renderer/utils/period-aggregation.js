/**
 * Period-aware data aggregation utilities for analytics charts
 */

/**
 * Aggregate daily data into weekly buckets (ISO weeks)
 * @param {Array} dailyData - Array of daily data points with { date, value }
 * @param {string} valueKey - The key to aggregate (e.g., 'steps', 'kcal_activas')
 * @param {string} aggregationType - 'sum' or 'avg'
 * @returns {Array} Array of weekly aggregated data
 */
export function aggregateToWeekly(dailyData, valueKey, aggregationType = 'sum') {
  if (!dailyData || dailyData.length === 0) return [];

  const weeks = new Map();

  dailyData.forEach(day => {
    const date = new Date(day.date);
    // Get ISO week number
    const weekStart = new Date(date);
    const dayNum = date.getDay() || 7; // Make Sunday = 7
    weekStart.setDate(date.getDate() - dayNum + 1); // Set to Monday
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        weekStart,
        values: [],
        label: `Sem ${getISOWeek(date)}`
      });
    }

    const value = day[valueKey] || 0;
    weeks.get(weekKey).values.push(value);
  });

  const result = Array.from(weeks.values()).map(week => {
    const aggregatedValue = aggregationType === 'sum'
      ? week.values.reduce((a, b) => a + b, 0)
      : week.values.reduce((a, b) => a + b, 0) / week.values.length;

    return {
      date: week.weekStart.toISOString().split('T')[0],
      label: week.label,
      value: Math.round(aggregatedValue * 10) / 10
    };
  });

  // Sort by date
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  return result;
}

/**
 * Aggregate daily data into monthly buckets
 * @param {Array} dailyData - Array of daily data points with { date, value }
 * @param {string} valueKey - The key to aggregate
 * @param {string} aggregationType - 'sum' or 'avg'
 * @returns {Array} Array of monthly aggregated data
 */
export function aggregateToMonthly(dailyData, valueKey, aggregationType = 'sum') {
  if (!dailyData || dailyData.length === 0) return [];

  const months = new Map();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  dailyData.forEach(day => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!months.has(monthKey)) {
      months.set(monthKey, {
        year: date.getFullYear(),
        month: date.getMonth(),
        values: [],
        label: monthNames[date.getMonth()]
      });
    }

    const value = day[valueKey] || 0;
    months.get(monthKey).values.push(value);
  });

  const result = Array.from(months.values()).map(month => {
    const aggregatedValue = aggregationType === 'sum'
      ? month.values.reduce((a, b) => a + b, 0)
      : month.values.reduce((a, b) => a + b, 0) / month.values.length;

    return {
      date: `${month.year}-${String(month.month + 1).padStart(2, '0')}-01`,
      label: month.label,
      value: Math.round(aggregatedValue * 10) / 10
    };
  });

  // Sort by date
  result.sort((a, b) => new Date(a.date) - new Date(b.date));
  return result;
}

/**
 * Get ISO week number from date
 */
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get aggregated data based on selected period
 * @param {Array} dailyData - Daily data points
 * @param {string} period - '7d', '1m', or '3m'
 * @param {string} valueKey - The key to aggregate
 * @param {string} aggregationType - 'sum' or 'avg'
 * @returns {Array} Aggregated data with labels
 */
export function getAggregatedData(dailyData, period, valueKey, aggregationType = 'sum') {
  if (!dailyData || dailyData.length === 0) return [];

  if (period === '7d') {
    // Return daily data with day labels
    return dailyData.map(d => ({
      date: d.date,
      label: new Date(d.date).toLocaleDateString('es-ES', { weekday: 'short' }),
      value: d[valueKey] || 0
    }));
  } else if (period === '1m') {
    return aggregateToWeekly(dailyData, valueKey, aggregationType);
  } else if (period === '3m') {
    return aggregateToMonthly(dailyData, valueKey, aggregationType);
  }

  return dailyData;
}
