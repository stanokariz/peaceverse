// src/components/ForecastChart.jsx

import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import SkeletonBlock from "./SkeletonBlock";

// Brand colors
const COLORS = {
  actual: "#007AFF",    // Blue
  forecast: "#34C759",  // Green
};

export default function ForecastChart({ forecast, loading }) {
  if (loading) {
    return <SkeletonBlock className="h-64 w-full" />;
  }

  return (
    <div className="p-4 rounded-xl shadow-md bg-white/60 dark:bg-gray-800/60 mt-6">
      <h2 className="text-lg font-semibold mb-3">Forecast</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={forecast}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={COLORS.actual}
            strokeWidth={2}
            dot={{ r: 4 }}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={COLORS.forecast}
            strokeWidth={2}
            dot={{ r: 4 }}
            strokeDasharray="5 5"
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-end mt-2 space-x-4 text-sm">
        <span className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.actual }}></span>
          <span>Actual</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.forecast }}></span>
          <span>Predicted</span>
        </span>
      </div>
    </div>
  );
}
