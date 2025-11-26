import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Brand colors
const COLORS = {
  primary: "#074F98", // Blue
  secondary: "#275432", // Green
  accent: "#986135", // Brown
  warning: "#E14AD4", // Pink
  light: "#E9D8B8", // Light Beige
};

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    loggedInUsers: 0,
    newUsersToday: 0,
    totalVisits: 0,
    todayVisits: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    topPages: { allTime: [], today: [], last7Days: [] },
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/stats");

      const safeStats = {
        totalUsers: res.data.stats?.totalUsers || 0,
        activeUsers: res.data.stats?.activeUsers || 0,
        loggedInUsers: res.data.stats?.usersLast24h || 0,
        newUsersToday: res.data.stats?.newUsersToday || 0,
        totalVisits: res.data.stats?.totalVisits || 0,
        todayVisits: res.data.stats?.todayVisits || 0,
        verifiedUsers: res.data.stats?.verifiedUsers || 0,
        unverifiedUsers:
          (res.data.stats?.totalUsers || 0) - (res.data.stats?.verifiedUsers || 0),
        topPages: {
          allTime: Array.isArray(res.data.stats?.topPages?.allTime)
            ? res.data.stats.topPages.allTime
            : [],
          today: Array.isArray(res.data.stats?.topPages?.today)
            ? res.data.stats.topPages.today
            : [],
          last7Days: Array.isArray(res.data.stats?.topPages?.last7Days)
            ? res.data.stats.topPages.last7Days
            : [],
        },
      };

      setStats(safeStats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch site statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardData = [
    { title: "Total Users", value: stats.totalUsers, color: COLORS.primary },
    { title: "Active Users", value: stats.activeUsers, color: COLORS.secondary },
    { title: "Logged In Users", value: stats.loggedInUsers, color: COLORS.accent },
    { title: "New Users Today", value: stats.newUsersToday, color: COLORS.warning },
    { title: "Total Visits", value: stats.totalVisits, color: COLORS.primary },
    { title: "Today's Visits", value: stats.todayVisits, color: COLORS.secondary },
  ];

  const verificationData = [
    { name: "Verified", value: stats.verifiedUsers },
    { name: "Unverified", value: stats.unverifiedUsers },
  ];

  const pieColors = [COLORS.secondary, COLORS.warning];

  const renderBarChart = (data) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="page" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="visits" fill={COLORS.accent} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-6 w-full space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-gray-600 dark:text-gray-300">Loading statistics…</div>
      ) : (
        <>
          {/* --- Cards --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {cardData.map(({ title, value, color }) => (
              <div
                key={title}
                className="p-5 rounded-xl shadow-lg flex flex-col justify-center items-center"
                style={{ backgroundColor: color, color: "#fff" }}
              >
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-3xl font-bold mt-2">{value}</p>
              </div>
            ))}
          </div>

          {/* --- User Verification Pie Chart --- */}
          <div className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              User Verification Status
            </h2>
            {stats.totalUsers === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No user data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={verificationData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {verificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* --- Top Pages Charts --- */}
          {["allTime", "today", "last7Days"].map((period) => (
            <div
              key={period}
              className="p-6 bg-white/90 dark:bg-gray-800/80 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Top Pages ({period === "allTime" ? "All Time" : period === "today" ? "Today" : "Last 7 Days"})
              </h2>
              {stats.topPages[period].length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No page visit data yet.</p>
              ) : (
                renderBarChart(stats.topPages[period])
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Admin;
