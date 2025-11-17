import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { toast } from "react-hot-toast";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  Tooltip, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// -----------------------------
// 🔥 CONSISTENT COLOR MAPPING
// -----------------------------
const CATEGORY_COLORS = {
  conflict: "#FF3B30",
  violence: "#FF9500",
  tension: "#FFD60A",
  displacement: "#34C759",
  "natural disaster": "#007AFF",
  other: "#AF52DE",
};

const SEVERITY_COLORS = {
  low: "#34C759",
  medium: "#FFD60A",
  high: "#FF9500",
  critical: "#FF3B30",
};

const COLORS = ["#FF3B30", "#FF9500", "#FFD60A", "#34C759", "#007AFF", "#AF52DE"];
const DEFAULT_COLOR = "#8884d8";

// Stable hash color for dynamic items (cities & countries)
function getStableColorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

// Premium tooltip styling for charts
const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.9)",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  backdropFilter: "blur(10px)",
};

// Reusable premium glass card
const cardClass =
  "rounded-2xl p-5 bg-white/70 dark:bg-gray-900/60 shadow-xl " +
  "border border-white/20 dark:border-gray-700/30 backdrop-blur-md";

// Heatmap overlay
function HeatmapLayer({ hotspots }) {
  const map = useMap();

  useEffect(() => {
    if (!hotspots || hotspots.length === 0) return;

    const heatData = hotspots.map(h => [
      h.location?.lat ?? 0,
      h.location?.lng ?? 0,
      h.avgSeverity / 4
    ]);

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 20,
      maxZoom: 12,
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [hotspots]);

  return null;
}

export default function Analytics() {
  const [incidents, setIncidents] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [cityHotspots, setCityHotspots] = useState([]);
  const [countryHotspots, setCountryHotspots] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    country: "",
    city: "",
    severity: ""
  });
  const [heatmapOnly, setHeatmapOnly] = useState(false);

  const updateFilter = patch => setFilters(f => ({ ...f, ...patch }));

  // -----------------------------
  // API CALLS
  // -----------------------------
  const fetchIncidents = async () => {
    try {
      const { data } = await api.get("/incidents", { params: filters });
      setIncidents(data.incidents || []);
    } catch {
      toast.error("Failed to fetch incidents");
    }
  };

  const fetchForecast = async () => {
    try {
      const { data } = await api.get("/forecast", {
        params: { country: filters.country, city: filters.city }
      });
      setForecast(data);
    } catch {
      toast.error("Failed to fetch forecast");
    }
  };

  const fetchCityHotspots = async () => {
    try {
      const { data } = await api.get("/hotspots/cities");
      const normalized = (Array.isArray(data) ? data : []).map(h => ({
        city: h._id?.city ?? "Unknown",
        country: h._id?.country ?? "",
        count: h.count ?? 0,
        lat: h.location?.lat ?? 0,
        lng: h.location?.lng ?? 0,
        avgSeverity: h.avgSeverity ?? 0,
      }));
      setCityHotspots(normalized);
    } catch {
      toast.error("Failed loading city hotspots");
      setCityHotspots([]);
    }
  };

  const fetchCountryHotspots = async () => {
    try {
      const { data } = await api.get("/hotspots/countries");
      const normalized = (Array.isArray(data) ? data : []).map(h => ({
        country: h._id ?? "Unknown",
        count: h.count ?? 0,
      }));
      setCountryHotspots(normalized);
    } catch {
      toast.error("Failed loading country hotspots");
      setCountryHotspots([]);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchForecast();
    fetchCityHotspots();
    fetchCountryHotspots();
  }, [filters]);

  // -----------------------------
  // DERIVED
  // -----------------------------
  const safeIncidents = incidents || [];
  const totalIncidents = safeIncidents.length;
  const categories = Object.keys(CATEGORY_COLORS);
  const severities = Object.keys(SEVERITY_COLORS);

  const verifiedCount = useMemo(
    () => safeIncidents.filter(i => i.isVerified).length,
    [safeIncidents]
  );

  const criticalCount = useMemo(
    () => safeIncidents.filter(i => i.severity === "critical").length,
    [safeIncidents]
  );

  const categoryData = useMemo(
    () => categories.map(c => ({
      category: c,
      count: safeIncidents.filter(i => i.category === c).length
    })),
    [safeIncidents]
  );

  const severityData = useMemo(
    () => severities.map(s => ({
      severity: s,
      count: safeIncidents.filter(i => i.severity === s).length
    })),
    [safeIncidents]
  );

  const trendData = useMemo(() => {
    const map = {};
    safeIncidents.forEach(i => {
      const date = new Date(i.createdAt).toISOString().split("T")[0];
      map[date] = (map[date] || 0) + 1;
    });

    return Object.keys(map)
      .sort()
      .map(date => ({ date, count: map[date] }));
  }, [safeIncidents]);

  return (
    <div className="p-6 w-full">

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-emerald-400 
            text-transparent bg-clip-text drop-shadow tracking-tight">
            Incident Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">
            AI-powered insights, hotspots & forecasts.
          </p>
        </div>

        <button
          onClick={() => setHeatmapOnly(!heatmapOnly)}
          className="px-5 py-2.5 rounded-xl font-semibold
            bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md
            hover:opacity-90 active:scale-95 transition"
        >
          {heatmapOnly ? "Show Full Dashboard" : "Heatmap-Only Mode"}
        </button>
      </div>

      {/* FILTER BAR */}
      {!heatmapOnly && (
        <div className="flex flex-wrap gap-3 mb-8 p-4 rounded-xl 
            bg-white/50 dark:bg-gray-900/40 backdrop-blur-md 
            shadow-lg border border-white/20 dark:border-gray-700/30">

          <input type="date" value={filters.dateFrom} onChange={e=>updateFilter({dateFrom:e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500" />

          <input type="date" value={filters.dateTo} onChange={e=>updateFilter({dateTo:e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-white/70 dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500" />

          <input type="text" placeholder="Country" value={filters.country}
            onChange={e=>updateFilter({country:e.target.value})}
            className="px-3 py-2 rounded-lg border bg-white/70 dark:bg-gray-800 
              border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500" />

          <input type="text" placeholder="City" value={filters.city}
            onChange={e=>updateFilter({city:e.target.value})}
            className="px-3 py-2 rounded-lg border bg-white/70 dark:bg-gray-800 
              border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500" />

          <select value={filters.category} onChange={e=>updateFilter({category:e.target.value})}
            className="px-3 py-2 rounded-lg border bg-white/70 dark:bg-gray-800 
              border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500">
            <option value="">Category (any)</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filters.severity} onChange={e=>updateFilter({severity:e.target.value})}
            className="px-3 py-2 rounded-lg border bg-white/70 dark:bg-gray-800 
              border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500">
            <option value="">Severity (any)</option>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* FORECAST */}
      {!heatmapOnly && forecast && (
        <div className={`${cardClass} mb-8`}>
          <h2 className="text-lg font-semibold mb-2">AI Forecast</h2>
          <p className="italic text-gray-700 dark:text-gray-300">{forecast.insights}</p>
        </div>
      )}

      {/* SUMMARY CARDS */}
      {!heatmapOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { title: "Total Incidents", value: totalIncidents, color: "from-blue-500 to-blue-400" },
            { title: "Verified", value: verifiedCount, color: "from-green-500 to-green-400" },
            { title: "Critical", value: criticalCount, color: "from-red-500 to-red-400" },
          ].map(card => (
            <motion.div key={card.title}
              className={`p-6 rounded-2xl shadow-xl text-white 
              bg-gradient-to-br ${card.color} transform hover:scale-[1.03] transition`}>
              <div className="text-sm opacity-90 font-medium">{card.title}</div>
              <div className="text-3xl font-extrabold mt-2 drop-shadow-md">{card.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CHARTS */}
      {!heatmapOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Category */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4">Incidents by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count">
                  {categoryData.map(item => (
                    <Cell key={item.category} fill={CATEGORY_COLORS[item.category] || DEFAULT_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Severity */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4">Incidents by Severity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={100}>
                  {severityData.map(item => (
                    <Cell key={item.severity} fill={SEVERITY_COLORS[item.severity] || DEFAULT_COLOR} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* City hotspots */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4">City Hotspots</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityHotspots}>
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count">
                  {cityHotspots.map(h => (
                    <Cell key={h.city} fill={getStableColorForName(h.city)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country hotspots */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-4">Country Hotspots</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={countryHotspots} dataKey="count" nameKey="country" cx="50%" cy="50%" outerRadius={100}>
                  {countryHotspots.map(h => (
                    <Cell key={h.country} fill={getStableColorForName(h.country)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* MAP */}
      <div className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-semibold mb-3">
          {heatmapOnly ? "Hotspot Heatmap (Officials Mode)" : "Incident Map"}
        </h2>

        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="rounded-xl overflow-hidden shadow-lg"
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <HeatmapLayer hotspots={cityHotspots} />

          {!heatmapOnly && safeIncidents.map((i, idx) => (
            <CircleMarker key={idx} center={[i.lat, i.lng]} radius={6} color="#FF3B30">
              <Popup>
                <strong>{i.title}</strong><br />
                {i.category} – {i.severity}<br />
                {i.city}, {i.country}<br />
                {new Date(i.createdAt).toLocaleDateString()}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
