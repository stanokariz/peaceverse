import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { CSVLink } from "react-csv";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const prev = [...users];
    setUsers(users.map(u => (u._id === id ? { ...u, role: newRole } : u)));

    try {
      await api.patch(`/users/${id}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update role");
      setUsers(prev);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const prev = [...users];
    setUsers(users.map(u => (u._id === id ? { ...u, isActive: !currentStatus } : u)));

    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error("Failed to update user status");
      setUsers(prev);
    }
  };

  const csvData = users.map(u => ({
    Email: u.email,
    Role: u.role,
    Active: u.isActive ? "Yes" : "No",
    "Is Logged In": u.isLoggedIn ? "Yes" : "No",
    "Last Login": u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-",
  }));

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 w-full">

      {/* HEADER + ACTION BAR */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">

        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
          Users Management
        </h1>

        <div className="flex gap-3">

          {/* Add User (optional, visible but non-functional placeholder) */}
          <button
            className="px-5 py-2 rounded-full font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(90deg,#0ea5e9,#16a34a,#facc15)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 3s ease infinite",
            }}
          >
            + Add User
          </button>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            className="px-5 py-2 rounded-full font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(90deg,#16a34a,#0ea5e9,#f97316,#facc15)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 3s ease infinite",
            }}
          >
            Refresh
          </button>

          {/* Export CSV */}
          <CSVLink
            data={csvData}
            filename="users.csv"
            className="px-5 py-2 rounded-full font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(90deg,#0ea5e9,#16a34a,#facc15,#f97316)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 3s ease infinite",
            }}
          >
            Export
          </CSVLink>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-3 text-red-600 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <div className="
        overflow-x-auto rounded-2xl 
        shadow-2xl border border-white/20 dark:border-gray-700 
        bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl
      ">
        <div className="min-w-[900px]">

          {/* TABLE HEADER */}
          <div className="
            grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold tracking-wide
            bg-gradient-to-r from-green-200 via-blue-200 to-yellow-200
            dark:from-green-800 dark:via-blue-800 dark:to-yellow-700
            rounded-t-2xl shadow-inner text-gray-900 dark:text-gray-100
          ">
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Logged In</div>
            <div className="col-span-3">Last Login</div>
          </div>

          <AnimatePresence>
            {loading ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300 text-sm">
                Loading users…
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300 text-sm">
                No users found.
              </div>
            ) : (
              users.map(u => (
                <motion.div
                  key={u._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className="
                    grid grid-cols-12 gap-2 px-4 py-3 
                    bg-white/60 dark:bg-gray-900/40 backdrop-blur-md
                    border-b border-gray-300 dark:border-gray-700
                    hover:bg-gradient-to-r hover:from-blue-50 hover:via-green-50 hover:to-yellow-50
                    dark:hover:from-blue-900 dark:hover:via-green-900 dark:hover:to-yellow-900
                    transition-all rounded-xl text-sm
                  "
                >
                  <div className="col-span-3 truncate">{u.email}</div>

                  {/* ROLE BADGE */}
                  <div className="col-span-2">
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      className={`
                        px-3 py-1 rounded-full font-semibold text-xs shadow 
                        hover:scale-110 transition-transform
                        ${u.role === "admin"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200"}
                      `}
                    >
                      {u.role.toUpperCase()}
                    </button>
                  </div>

                  {/* ACTIVE BADGE */}
                  <div className="col-span-2">
                    <button
                      onClick={() => toggleActive(u._id, u.isActive)}
                      className={`
                        px-3 py-1 rounded-full font-semibold text-xs shadow hover:scale-110 transition-transform
                        ${u.isActive
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"}
                      `}
                    >
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  <div className="col-span-2">
                    {u.isLoggedIn ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">No</span>
                    )}
                  </div>

                  <div className="col-span-3">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
