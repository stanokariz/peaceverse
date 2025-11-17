// src/components/HeatmapMonth.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import SkeletonBlock from "./SkeletonBlock";

// Premium brand colors
const COLORS = {
  empty: "#F0F0F0",
  low: "#34C759",      // Green
  medium: "#FFD60A",   // Gold
  high: "#007AFF",     // Blue
  critical: "#FF9500", // Orange
};

// Map incident count to color
const severityToColor = (count, maxCount) => {
  if (count === 0) return COLORS.empty;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return COLORS.low;
  if (ratio <= 0.5) return COLORS.medium;
  if (ratio <= 0.75) return COLORS.high;
  return COLORS.critical;
};

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
const getFirstDayIndex = (year, month) => new Date(year, month - 1, 1).getDay();

export default function HeatmapMonth({ year, month, data = [], loading = false, onDayClick }) {

  const days = useMemo(() => {
    if (!data || loading) return [];

    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayIndex(year, month);
    const maxCount = Math.max(...data.map(d => d.count), 1);

    // Add empty slots before first day
    const arr = Array.from({ length: firstDayIndex }, () => null);

    for (let day = 1; day <= totalDays; day++) {
      const dayData = data.find(d => d.day === day);
      const count = dayData ? dayData.count : 0;
      arr.push({
        day,
        count,
        color: severityToColor(count, maxCount),
      });
    }
    return arr;
  }, [data, year, month, loading]);

  if (loading) return <SkeletonBlock className="h-80 w-full rounded-xl" />;

  return (
    <div className="p-4 rounded-xl shadow-md bg-white/60 dark:bg-gray-800/60 mt-6">
      <h2 className="text-lg font-semibold mb-4">
        {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
      </h2>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center font-medium">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => {
          if (!d) return <div key={idx} className="h-10 w-10" />;
          return (
            <motion.div
              key={d.day}
              className="h-10 w-10 flex items-center justify-center rounded-lg shadow-sm cursor-pointer text-white font-semibold text-sm transition-transform duration-200"
              style={{ backgroundColor: d.color }}
              whileHover={{ scale: 1.1 }}
              onClick={() => onDayClick?.(d.day)}
              title={`Day ${d.day} — ${d.count} incidents`}
            >
              {d.day}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
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
