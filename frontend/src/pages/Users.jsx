import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { CSVLink } from "react-csv";
import { FaTrash } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLoggedIn, setFilterLoggedIn] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

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
    if (currentRole === "admin") return;
    const cycle = ["user", "editor"];
    const nextRole = cycle[(cycle.indexOf(currentRole) + 1) % cycle.length];
    const prev = [...users];
    setUsers(users.map(u => (u._id === id ? { ...u, role: nextRole } : u)));
    try {
      await api.patch(`/users/${id}`, { role: nextRole });
      toast.success(`Role updated to ${nextRole}`);
    } catch {
      toast.error("Failed to update role");
      setUsers(prev);
    }
  };

  const toggleActive = async (id, currentStatus, role) => {
    if (role === "admin") return;
    const prev = [...users];
    setUsers(users.map(u => (u._id === id ? { ...u, isActive: !currentStatus } : u)));
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update user status");
      setUsers(prev);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setConfirmOpen(false);
    const prev = [...users];
    const newUsers = users.filter(u => u._id !== id);
    setUsers(newUsers);

    // Adjust current page if needed
    const filteredAfterDelete = filteredUsersAfterSlice(newUsers);
    if (filteredAfterDelete.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
      setUsers(prev);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setConfirmOpen(false);
  };

  const csvData = users.map(u => ({
    Email: u.email,
    "Phone No.": u.phoneNumber || "-",
    Role: u.role,
    Active: u.isActive ? "Yes" : "No",
    "Is Logged In": u.isLoggedIn ? "Yes" : "No",
    "Last Login": u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"
  }));

  const timeAgo = date => {
    if (!date) return "-";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const lastLoginColor = date => {
    if (!date) return "text-gray-500";
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 3600) return "text-green-600 dark:text-green-400";
    if (diff < 86400) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const filteredUsers = users.filter(u => {
    if (searchText) {
      const lower = searchText.toLowerCase();
      if (
        !u.email.toLowerCase().includes(lower) &&
        !(u.phoneNumber && u.phoneNumber.toLowerCase().includes(lower))
      ) return false;
    }
    if (filterRole && u.role !== filterRole) return false;
    if (filterStatus) {
      if (filterStatus === "active" && !u.isActive) return false;
      if (filterStatus === "inactive" && u.isActive) return false;
    }
    if (filterLoggedIn) {
      if (filterLoggedIn === "yes" && !u.isLoggedIn) return false;
      if (filterLoggedIn === "no" && u.isLoggedIn) return false;
    }
    return true;
  });

  // Reset page to 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterRole, filterStatus, filterLoggedIn, usersPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Helper for adjusting page after delete
  const filteredUsersAfterSlice = (usersList) => {
    const filtered = usersList.filter(u => {
      if (searchText) {
        const lower = searchText.toLowerCase();
        if (
          !u.email.toLowerCase().includes(lower) &&
          !(u.phoneNumber && u.phoneNumber.toLowerCase().includes(lower))
        ) return false;
      }
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus) {
        if (filterStatus === "active" && !u.isActive) return false;
        if (filterStatus === "inactive" && u.isActive) return false;
      }
      if (filterLoggedIn) {
        if (filterLoggedIn === "yes" && !u.isLoggedIn) return false;
        if (filterLoggedIn === "no" && u.isLoggedIn) return false;
      }
      return true;
    });
    return filtered.slice(
      (currentPage - 1) * usersPerPage,
      currentPage * usersPerPage
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} className="bg-yellow-300 dark:bg-yellow-600 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-4 w-full">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
          Users Management
        </h1>

        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="px-5 py-2 rounded-full font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(90deg,#16a34a,#0ea5e9,#f97316,#facc15)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 3s ease infinite"
            }}
          >
            Refresh
          </button>

          <CSVLink
            data={csvData}
            filename="users.csv"
            className="px-5 py-2 rounded-full font-semibold text-white shadow-md hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(90deg,#0ea5e9,#16a34a,#facc15,#f97316)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 3s ease infinite"
            }}
          >
            Export
          </CSVLink>
        </div>
      </div>

      {/* SEARCH + FILTERS + PAGE SIZE */}
      <div className="flex flex-wrap gap-2 mb-3 text-sm items-center">
        <input
          type="text"
          placeholder="Search email or phone..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="px-2 py-1 border rounded shadow-sm text-sm"
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterLoggedIn}
          onChange={e => setFilterLoggedIn(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All Logged In</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <div className="flex items-center gap-1">
          <label className="text-sm">Per page:</label>
          <select
            value={usersPerPage}
            onChange={e => setUsersPerPage(Number(e.target.value))}
            className="px-2 py-1 border rounded"
          >
            {[5, 10, 20, 50].map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-3 text-red-600 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl">
        <div className="min-w-[900px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold tracking-wide bg-gradient-to-r from-green-200 via-blue-200 to-yellow-200 dark:from-green-800 dark:via-blue-800 dark:to-yellow-700 rounded-t-2xl shadow-inner text-gray-900 dark:text-gray-100">
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone No.</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Logged In</div>
            <div className="col-span-3">Last Login</div>
            <div className="col-span-1">Delete</div>
          </div>

          <AnimatePresence>
            {loading ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300 text-sm">
                Loading users…
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300 text-sm">
                No users found.
              </div>
            ) : (
              paginatedUsers.map(u => (
                <motion.div
                  key={u._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className="grid grid-cols-12 gap-2 px-4 py-3 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md border-b border-gray-300 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-green-50 hover:to-yellow-50 dark:hover:from-blue-900 dark:hover:via-green-900 dark:hover:to-yellow-900 transition-all rounded-xl text-sm"
                >
                  <div className="col-span-3 truncate">{highlightMatch(u.email, searchText)}</div>
                  <div className="col-span-2">{u.phoneNumber ? highlightMatch(u.phoneNumber, searchText) : "-"}</div>

                  <div className="col-span-1">
                    <button
                      disabled={u.role === "admin"}
                      onClick={() => toggleRole(u._id, u.role)}
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] shadow transition-transform ${
                        u.role === "admin"
                          ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                          : u.role === "user"
                          ? "bg-blue-500 text-white hover:scale-110"
                          : "bg-orange-500 text-white hover:scale-110"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </button>
                  </div>

                  <div className="col-span-1">
                    <button
                      disabled={u.role === "admin"}
                      onClick={() => toggleActive(u._id, u.isActive, u.role)}
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] shadow transition-transform ${
                        u.role === "admin"
                          ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                          : u.isActive
                          ? "bg-green-500 text-white hover:scale-110"
                          : "bg-red-500 text-white hover:scale-110"
                      }`}
                    >
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  <div className="col-span-1">
                    {u.isLoggedIn ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-500 font-semibold">No</span>
                    )}
                  </div>

                  <div className={`col-span-3 ${lastLoginColor(u.lastLogin)}`}>
                    {timeAgo(u.lastLogin)}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => handleDeleteClick(u._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 transition-transform"
                      title="Delete user"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2 text-sm">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              } transition`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64 text-center"
            >
              <p className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-around">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
