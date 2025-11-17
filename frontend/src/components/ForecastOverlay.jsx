// src/components/ForecastOverlay.jsx

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import SkeletonBlock from "./SkeletonBlock";

// Brand colors
const COLORS = {
  actual: "#007AFF",    // Blue
  forecast: "#FFD60A",  // Gold
};

export default function ForecastOverlay({ actual, forecast, loading }) {
  if (loading) {
    return <SkeletonBlock className="h-64 w-full" />;
  }

  // Merge actual and forecast for overlay chart
  const mergedData = actual.map((item, idx) => ({
    date: item.date,
    actual: item.count,
    predicted: forecast[idx]?.predicted || null,
  }));

  return (
    <div className="p-4 rounded-xl shadow-md bg-white/60 dark:bg-gray-800/60 mt-6">
      <h2 className="text-lg font-semibold mb-3">Actual vs Forecast Overlay</h2>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mergedData}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="actual"
            stroke={COLORS.actual}
            fill={COLORS.actual + "33"} // 20% opacity
            strokeWidth={2}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke={COLORS.forecast}
            fill={COLORS.forecast + "33"} // 20% opacity
            strokeDasharray="5 5"
            strokeWidth={2}
            animationDuration={800}
          />
        </AreaChart>
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
