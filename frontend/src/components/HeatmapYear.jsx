// src/components/HeatmapYear.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import SkeletonBlock from "./SkeletonBlock";

const COLORS = {
  empty: "#F0F0F0",
  low: "#34C759",
  medium: "#FFD60A",
  high: "#007AFF",
  critical: "#FF9500",
};

const severityToColor = (count, maxCount) => {
  if (count === 0) return COLORS.empty;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return COLORS.low;
  if (ratio <= 0.5) return COLORS.medium;
  if (ratio <= 0.75) return COLORS.high;
  return COLORS.critical;
};

export default function HeatmapYear({ year, incidents = [], loading = false, onMonthSelect }) {

  const months = useMemo(() => {
    if (loading || !incidents) return [];

    const maxCount = Math.max(...incidents.map(m => m.count), 1);

    return Array.from({ length: 12 }, (_, i) => {
      const monthData = incidents.find(m => m.month === i + 1);
      const count = monthData ? monthData.count : 0;
      return {
        month: i + 1,
        count,
        color: severityToColor(count, maxCount),
      };
    });
  }, [incidents, loading]);

  if (loading) return <SkeletonBlock className="h-64 w-full rounded-xl" />;

  return (
    <div className="p-4 rounded-xl shadow-md bg-white/60 dark:bg-gray-800/60">
      <h2 className="text-lg font-semibold mb-4">{year} Overview</h2>
      <div className="grid grid-cols-12 gap-1">
        {months.map((m) => (
          <motion.div
            key={m.month}
            className="h-10 flex-1 flex items-center justify-center rounded-lg shadow-sm cursor-pointer text-white font-semibold text-sm transition-transform duration-200"
            style={{ backgroundColor: m.color }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onMonthSelect?.(m.month)}
            title={`${new Date(year, m.month - 1).toLocaleString("default", { month: "long" })} — ${m.count} incidents`}
          >
            {m.month}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-3 text-xs">
        {["Low", "Medium", "High", "Critical"].map((label, i) => (
          <div key={i} className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(COLORS)[i + 1] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
