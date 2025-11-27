// src/pages/sidebar/AllIncidents.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api"; // your axios instance
import { Trash2 } from "react-feather";
import { CSVLink } from "react-csv";
import "./AllIncidents.css"; // imported CSS for animations

export default function AllIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    country: "",
    city: "",
    category: "",
    severity: "",
    verified: "",
    q: "",
    dateFrom: "",
    dateTo: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, current: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/incidents/all/all", { params: filters });
      setIncidents(res.data.incidents || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.country,
    filters.city,
    filters.category,
    filters.severity,
    filters.verified,
    filters.q,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const updateFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const toggleVerified = (id, current) => setConfirmModal({ open: true, id, current });

  const handleConfirmToggle = async () => {
    const { id, current } = confirmModal;
    setConfirmModal({ open: false, id: null, current: false });
    const prev = [...incidents];
    setIncidents((inc) => inc.map((i) => (i._id === id ? { ...i, isVerified: !current } : i)));

    try {
      const res = await api.patch(`/incidents/all/verify/${id}`, { isVerified: !current });
      setIncidents((inc) => inc.map((i) => (i._id === id ? res.data : i)));
      toast.success(!current ? "Verified" : "Unverified");
    } catch (err) {
      toast.error("Failed to update verification");
      setIncidents(prev);
    }
  };

  const openDeleteModal = (id) => setDeleteModal({ open: true, id });
  const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    closeDeleteModal();
    try {
      await api.delete(`/incidents/all/${id}`);
      setIncidents((prev) => prev.filter((it) => it._id !== id));
      toast.success("Incident deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete incident");
    }
  };

  const categories = useMemo(
    () => ["", "conflict", "violence", "tension", "displacement", "natural disaster", "other"],
    []
  );
  const severities = useMemo(() => ["", "low", "medium", "high", "critical"], []);

  const severityIcons = {
    low: "🟢",
    medium: "⚠️",
    high: "🔥",
    critical: "💥",
  };

  const csvData = incidents.map((i) => ({
    Title: i.title,
    Description: i.description,
    Category: i.category,
    Severity: i.severity,
    City: i.city,
    Country: i.country,
    Verified: i.isVerified ? "Yes" : "No",
    VerifiedBy: i.verifiedBy?.email || "",
    CreatedAt: new Date(i.createdAt).toLocaleString(),
  }));

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-5 w-full">

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 text-transparent bg-clip-text">
          All Incident Reports
        </h1>
        <p className="text-gray-600 mt-1">
          View, verify, filter and manage reported incidents across Africa.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">

        <div className="flex items-center gap-3 flex-wrap">
          <input
            placeholder="Search title / description / city"
            value={filters.q}
            onChange={(e) => updateFilter({ q: e.target.value })}
            className="px-4 py-2 rounded-lg border bg-white/50 shadow-sm backdrop-blur-sm w-full sm:w-72 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={filters.category}
            onChange={(e) => updateFilter({ category: e.target.value })}
            className="px-3 py-2 rounded-lg border bg-white/50 text-sm shadow-sm backdrop-blur-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "" ? "Category (any)" : c}
              </option>
            ))}
          </select>

          <select
            value={filters.severity}
            onChange={(e) => updateFilter({ severity: e.target.value })}
            className="px-3 py-2 rounded-lg border bg-white/50 text-sm shadow-sm backdrop-blur-sm"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "Severity (any)" : s}
              </option>
            ))}
          </select>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fetch()}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition animate-flashBrandButton"
          >
            Refresh
          </button>

          <CSVLink
            data={csvData}
            filename="incidents.csv"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition animate-flashBrandButton"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto w-full rounded-xl border border-gray-200 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl">
        <div className="min-w-[950px]">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold px-4 py-3 border-b 
            bg-gradient-to-r from-blue-100/70 via-green-100/60 to-orange-100/60 
            dark:from-blue-900/40 dark:via-green-900/30 dark:to-orange-900/20
            rounded-t-xl uppercase tracking-wide text-gray-700 dark:text-gray-200">
            <div className="col-span-3">Title / Description</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1">Category</div>
            <div className="col-span-1">Severity</div>
            <div className="col-span-1">Verified</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <AnimatePresence>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-600">Loading...</div>
            ) : incidents.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">No incidents found.</div>
            ) : (
              incidents.map((it, index) => (
                <motion.div
                  key={it._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-2 items-start px-4 py-4 border-b border-gray-200 dark:border-gray-700
                    hover:bg-gradient-to-r hover:from-blue-50 hover:via-green-50 hover:to-orange-50 
                    dark:hover:from-blue-800/40 dark:hover:via-green-800/40 dark:hover:to-orange-800/30
                    transition-all rounded-md bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm relative"
                >
                  {/* Animated left border */}
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-md animate-flashBrand"></div>

                  {/* Title */}
                  <div className="col-span-3 truncate">
                    <div className="font-semibold bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent line-clamp-2">
                      {it.title}
                    </div>
                    <div className="text-xs mt-1 text-gray-700 dark:text-gray-400 line-clamp-2">
                      {it.description}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {it.city}, {it.country}
                  </div>

                  {/* Category */}
                  <div className="col-span-1 text-sm capitalize font-semibold"
                    style={{color: it.category === "conflict" ? "#FF3B30" : it.category === "violence" ? "#FF9500" : it.category === "displacement" ? "#FFCC00" : it.category === "natural disaster" ? "#007AFF" : "#4CD964"}}
                  >
                    {it.category}
                  </div>

                  {/* Severity */}
                  <div className="col-span-1 text-sm capitalize flex items-center gap-1">
                    <span>{severityIcons[it.severity]}</span>
                    <span>{it.severity}</span>
                  </div>

                  {/* Verified toggle */}
                  <div className="col-span-1 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!it.isVerified}
                        onChange={() => toggleVerified(it._id, !!it.isVerified)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <div className="text-xs">{it.isVerified ? "Yes" : "No"}</div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end items-center gap-3">
                    <button
                      onClick={() => openDeleteModal(it._id)}
                      className="p-2 rounded-full bg-red-50 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 transition shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page {filters.page} of {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateFilter({ page: Math.max(1, filters.page - 1) })}
            disabled={filters.page <= 1}
            className="px-3 py-1 rounded-lg border text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

          <button
            onClick={() => updateFilter({ page: Math.min(totalPages, filters.page + 1) })}
            disabled={filters.page >= totalPages}
            className="px-3 py-1 rounded-lg border text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Verify Modal */}
      <AnimatePresence>
        {confirmModal.open && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 text-center shadow-xl backdrop-blur-md"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <p className="mb-4 text-gray-900 dark:text-gray-100">
                Are you sure you want to{" "}
                <span className="font-semibold">{!confirmModal.current ? "verify" : "unverify"}</span> this incident?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmToggle}
                  className="px-4 py-1 rounded-lg bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 text-white shadow hover:scale-105 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmModal({ open: false, id: null, current: false })}
                  className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 text-center shadow-xl backdrop-blur-md"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <p className="mb-4 text-gray-900 dark:text-gray-100">
                Are you sure you want to <span className="text-red-500 font-semibold">delete</span> this incident?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-1 bg-red-600 text-white rounded-lg hover:scale-105 transition"
                >
                  Delete
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
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
