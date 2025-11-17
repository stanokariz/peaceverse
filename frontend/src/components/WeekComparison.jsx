// src/components/WeekComparison.jsx

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SkeletonBlock from "./SkeletonBlock";

export default function WeekComparison({ lastWeek, prevWeek, summary, loading }) {
  if (loading) return <SkeletonBlock className="h-72 w-full" />;

  const combined = lastWeek.map((d, i) => ({
    date: d.date,
    last: d.count,
    prev: prevWeek[i] ? prevWeek[i].count : null,
  }));

  return (
    <div className="p-4 rounded-xl shadow-md bg-white/60 dark:bg-gray-800/60 mt-6">
      <h2 className="text-lg font-semibold mb-3">Week-vs-Week Comparison</h2>

      {/* Summary Text */}
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {summary}
      </p>

      {/* Dual-line comparison */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={combined}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="prev"
            stroke="#ff7f50"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="last"
            stroke="#007AFF"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
