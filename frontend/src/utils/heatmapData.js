export function generateYearHeatmapData(incidents, year, filters = {}) {
  const { category, severity, dateFrom, dateTo } = filters;

  // Filter incidents
  const filtered = incidents.filter(incident => {
    const incidentDate = new Date(incident.date);
    const incidentYear = incidentDate.getFullYear();

    if (incidentYear !== year) return false;
    if (category && incident.category !== category) return false;
    if (severity && incident.severity !== severity) return false;
    if (dateFrom && incidentDate < new Date(dateFrom)) return false;
    if (dateTo && incidentDate > new Date(dateTo)) return false;

    return true;
  });

  // Count per month
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const count = filtered.filter(inc => new Date(inc.date).getMonth() + 1 === month).length;
    return { month, count };
  });
}
