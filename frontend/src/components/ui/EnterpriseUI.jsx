import { motion } from "framer-motion";

// -------------------------------
// ENTERPRISE COLORS (Azure Style)
// -------------------------------
export const colors = {
  blue: "#2563eb",
  blueLight: "#3b82f6",
  gray900: "#1f2937",
  gray700: "#374151",
  gray500: "#6b7280",
  gray200: "#e5e7eb",
  gray100: "#f3f4f6",
};

// -------------------------------
// SECTION HEADER
// -------------------------------
export function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5 text-blue-600" />}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {children}
      </h2>
    </div>
  );
}

// -------------------------------
// GLASS CARD WRAPPER
// -------------------------------
export function Card({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-xl p-5 bg-white/80 dark:bg-gray-900/50 
        backdrop-blur-md border border-gray-200 dark:border-gray-700 
        shadow-sm hover:shadow-md transition ${className}
      `}
    >
      {children}
    </div>
  );
}

// -------------------------------
// METRIC CARD (animated)
// -------------------------------
export function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`
        flex items-center justify-between p-5 rounded-xl bg-gradient-to-br 
        ${color} text-white shadow-md hover:shadow-lg
      `}
    >
      <div>
        <div className="text-sm font-medium opacity-80">{title}</div>
        <div className="text-3xl font-extrabold mt-1">{value}</div>
      </div>
      {Icon && <Icon className="w-10 h-10 opacity-80" />}
    </motion.div>
  );
}

// -------------------------------
// SKELETONS
// -------------------------------
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 h-24 w-full" />
  );
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 h-72 w-full" />
  );
}

export function SkeletonMap() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 h-[450px] w-full" />
  );
}

