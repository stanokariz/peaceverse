// src/pages/sidebar/Analytics.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

/* Skeleton Loader Component */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-300/50 dark:bg-gray-700/50 rounded-md ${className}`} />
);

export default function Analytics() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
  });

  const updateFilter = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const fetchIncidents = async () => {
    setLoading(true);
    const params = {
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.category && { category: filters.category }),
    };

    try {
      const res = await api.get("/incidents/all/all", { params });
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const categories = ["conflict", "violence", "tension", "displacement", "natural disaster", "other"];
  const severities = ["low", "medium", "high", "critical"];

  /* Derived Stats */
  const totalIncidents = incidents.length;

  const verifiedCount = useMemo(
    () => incidents.filter((i) => i.isVerified).length,
    [incidents]
  );

  const criticalCount = useMemo(
    () => incidents.filter((i) => i.severity === "critical").length,
    [incidents]
  );

  /* Category Bar Data */
  const categoryData = useMemo(
    () =>
      categories.map((c) => ({
        category: c,
        count: incidents.filter((i) => i.category === c).length,
      })),
    [incidents]
  );

  /* Severity Pie Data */
  const severityData = useMemo(
    () =>
      severities.map((s) => ({
        severity: s,
        count: incidents.filter((i) => i.severity === s).length,
      })),
    [incidents]
  );

  /* Trend Line Data */
  const trendData = useMemo(() => {
    const map = {};
    incidents.forEach((i) => {
      const date = new Date(i.createdAt).toISOString().split("T")[0];
      map[date] = (map[date] || 0) + 1;
    });

    return Object.keys(map)
      .sort()
      .map((date) => ({ date, count: map[date] }));
  }, [incidents]);

  /* AI Insight Summary */
  const insights = useMemo(() => {
    if (trendData.length < 2) return "Not enough data for insights.";

    const last7 = trendData.slice(-7).reduce((sum, d) => sum + d.count, 0);
    const prev7 = trendData.slice(-14, -7).reduce((sum, d) => sum + d.count, 0);

    const diff = last7 - prev7;
    const pct = prev7 ? Math.round((diff / prev7) * 100) : 100;

    const highestCategory = [...categoryData].sort((a, b) => b.count - a.count)[0];
    const highestSeverity = [...severityData].sort((a, b) => b.count - a.count)[0];

    let summary = "";

    // Trend insight
    if (diff > 0) summary += `Incidents increased by ${pct}% this week. `;
    else if (diff < 0) summary += `Incidents dropped by ${Math.abs(pct)}% this week. `;
    else summary += "Incident volume remained stable this week. ";

    // Category insight
    if (highestCategory.count > 0)
      summary += `The most reported category is "${highestCategory.category}". `;

    // Severity insight
    if (highestSeverity.count > 0)
      summary += `Most incidents are rated as "${highestSeverity.severity}" severity.`;

    return summary.trim();
  }, [trendData, categoryData, severityData]);

  const COLORS = ["#FF3B30", "#FF9500", "#FFD60A", "#34C759", "#007AFF", "#AF52DE"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-5 w-full">

      {/* TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 text-transparent bg-clip-text">
          Incident Analytics
        </h1>
        <p className="text-gray-600 mt-1">AI-powered insights and visual breakdowns.</p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter({ dateFrom: e.target.value })}
          className="px-4 py-2 rounded-lg border bg-white/50 shadow-sm backdrop-blur-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter({ dateTo: e.target.value })}
          className="px-4 py-2 rounded-lg border bg-white/50 shadow-sm backdrop-blur-sm"
        />
        <select
          value={filters.category}
          onChange={(e) => updateFilter({ category: e.target.value })}
          className="px-3 py-2 rounded-lg border bg-white/50 shadow-sm backdrop-blur-sm"
        >
          <option value="">Category (any)</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={fetchIncidents}
          className="px-4 py-2 rounded-lg text-white font-medium shadow-md bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 hover:scale-[1.02] transition"
        >
          Refresh
        </button>
      </div>

      {/* AI INSIGHT SUMMARY */}
      <div className="p-4 mb-6 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">AI Insights</h2>
        <p className="text-gray-700 dark:text-gray-300 italic">
          {loading ? "Analyzing..." : insights}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {loading
          ? [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          : [
              { title: "Total Incidents", value: totalIncidents, color: "from-blue-500 to-blue-400" },
              { title: "Verified", value: verifiedCount, color: "from-green-500 to-green-400" },
              { title: "Critical", value: criticalCount, color: "from-red-500 to-red-400" },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg backdrop-blur-md`}
              >
                <div className="text-sm font-semibold">{card.title}</div>
                <div className="text-2xl font-bold mt-2">{card.value}</div>
              </motion.div>
            ))}
      </motion.div>

      {/* CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CATEGORY BAR CHART */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Incidents by Category</h2>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  animationDuration={800}
                  animationBegin={200}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* SEVERITY PIE CHART */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Incidents by Severity</h2>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  animationDuration={900}
                  animationBegin={100}
                >
                  {severityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TREND LINE CHART */}
        <div className="col-span-1 lg:col-span-2 bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Incident Trend Over Time</h2>
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#007AFF"
                  strokeWidth={3}
                  dot={false}
                  animationDuration={1000}
                  animationBegin={200}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
