// src/components/SkeletonBlock.jsx

import React from "react";

export default function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-300/50 dark:bg-gray-700/50 rounded-lg ${className}`}
    />
  );
}
