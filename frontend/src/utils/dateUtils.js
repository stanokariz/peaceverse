// src/utils/dateUtils.js

/**
 * Groups incidents by YYYY-MM-DD
 */
export function groupByDate(incidents) {
  const map = {};
  incidents.forEach((i) => {
    const d = new Date(i.createdAt).toISOString().split("T")[0];
    map[d] = (map[d] || 0) + 1;
  });
  return map;
}

/**
 * Generates a full year array of { date, count }
 */
export function generateYearHeatmapData(incidents, year) {
  const grouped = groupByDate(incidents);
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);

  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    days.push({
      date: key,
      count: grouped[key] || 0,
    });
  }
  return days;
}

/**
 * Generates a month calendar grid (weeks × days)
 */
export function generateMonthHeatmapData(incidents, year, month) {
  const grouped = groupByDate(incidents);

  // month = 1-12
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);

  const data = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    data.push({
      date: key,
      count: grouped[key] || 0,
      day: d.getDay(),
    });
  }
  return data;
}
