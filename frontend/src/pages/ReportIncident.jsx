// src/pages/ReportIncident.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

/**
 * ReportIncident - visually matches SharePeaceStory styles and animations.
 * - Theme toggle toggles the `dark` class on <html> for a global effect.
 * - Coins animation plays only after a successful reporting.
 * - Defensive guards prevent crash when incidents or fields are undefined.
 */

export default function ReportIncident() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // 'light' or 'dark'
  const [loading, setLoading] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showCoins, setShowCoins] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    severity: "low",
    city: "",
    country: "",
    lat: null,
    lng: null,
  });

  // SharePeaceStory colors / gradients so visuals match
  const borderColors = ["#16a34a", "#3b82f6", "#f97316", "#facc15"];
  const bgColors = ["#f0fdf4", "#eff6ff", "#fff7ed", "#fefce8"];
  const gradientColors = ["#16a34a", "#3b82f6", "#f97316", "#facc15"];

  // Animation variants (same pattern as SharePeaceStory)
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  // Toggle theme both locally and app-wide (adds/removes html.dark)
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
  }, [theme]);

  // Fetch current user (local fallback), and user's incidents
  useEffect(() => {
    fetchUserAndIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserAndIncidents = async () => {
    try {
      if (!user) return; // guest
      const res = await api.get(`/incidents/user/${user._id}`);
      // defensive: ensure array
      setIncidents(Array.isArray(res.data) ? res.data : res.data?.incidents || []);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
      toast.error("Failed to load incidents");
      setIncidents([]);
    }
  };

  // Reverse geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const city = data?.address?.city || data?.address?.town || data?.address?.village || "Unknown";
      const country = data?.address?.country || "Unknown";
      setForm((f) => ({ ...f, city, country }));
    } catch (err) {
      console.error("reverseGeocode error:", err);
      setForm((f) => ({ ...f, city: "Unknown", country: "Unknown" }));
    }
  };

  // Capture geolocation when modal opens (so form can have location)
  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm((f) => ({ ...f, lat, lng }));
        reverseGeocode(lat, lng);
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Unable to fetch location. Please enable geolocation.");
      }
    );
  };

  // Open modal: capture location immediately
  const openModal = () => {
    captureLocation();
    setModalOpen(true);
  };

  // Submit incident
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to report an incident");
    if (!form.title || !form.description) return toast.error("Title and description are required");
    if (!form.lat || !form.lng) return toast.error("Location not captured yet");

    setLoading(true);
    try {
      const res = await api.post("/incidents", { ...form, userId: user._id });
      // server should return new incident; defensive checks:
      const saved = res.data?.incident || res.data;
      if (saved) {
        setIncidents((prev) => [saved, ...prev.filter(Boolean)]);
      } else {
        // if API returned something else, refetch list
        await fetchUserAndIncidents();
      }

      // show celebration: coins + modal
      setShowCoins(true);
      setShowCongratsModal(true);
      setTimeout(() => {
        setShowCoins(false);
      }, 3500); // coins run for ~3.5s
      setTimeout(() => {
        setShowCongratsModal(false);
      }, 5000); // modal disappears after 5s

      // reset form
      setForm({
        title: "",
        description: "",
        category: "other",
        severity: "low",
        city: form.city || "",
        country: form.country || "",
        lat: form.lat,
        lng: form.lng,
      });
      setModalOpen(false);
      toast.success("Incident reported successfully!");
    } catch (err) {
      console.error("Failed to report", err);
      toast.error(err.response?.data?.message || "Failed to report incident");
    } finally {
      setLoading(false);
    }
  };

  // Defensive renderer for cards to avoid undefined property access
  const safeString = (val) => (val === null || val === undefined ? "—" : String(val));

  return (
    <div className={`relative min-h-screen transition-colors duration-700 ${theme === "dark" ? "bg-[#0d1117] text-white" : "bg-[#f9fafb] text-gray-900"}`}>
      {/* Animated decorative orbs (like SharePeaceStory) */}
      <motion.div className={`absolute w-72 h-72 rounded-full ${theme === "dark" ? "bg-blue-600/10" : "bg-blue-500/10"} blur-3xl top-10 left-10`} animate={{ y: [0, 30, 0], opacity: [0.9, 0.5, 0.9] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className={`absolute w-96 h-96 rounded-full ${theme === "dark" ? "bg-green-500/8" : "bg-green-500/10"} blur-3xl bottom-20 right-10`} animate={{ y: [0, -30, 0], opacity: [0.8, 0.4, 0.8] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />

      {/* Header area */}
      <div className="relative z-10 max-w-[1400px] mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-orange-400">
            Report an Incident
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className={`p-2 rounded-full border ${theme === "dark" ? "border-white/20" : "border-gray-300"} bg-transparent`}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <button
              onClick={openModal}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-green-600 to-orange-500 shadow-md hover:shadow-lg transition-all"
            >
              + Add Incident
            </button>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            >
              <motion.form
                className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${theme === "dark" ? "bg-[#161b22] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
              >
                <h2 className="text-xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                  Report an Incident
                </h2>

                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className={`border p-2 rounded-md w-full mb-3 text-sm focus:ring-2 outline-none ${theme === "dark" ? "bg-transparent border-white/20 text-white" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className={`border p-2 rounded-md w-full mb-3 text-sm h-28 resize-none focus:ring-2 outline-none ${theme === "dark" ? "bg-transparent border-white/20 text-white" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                />

                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={`border p-2 rounded-md w-full mb-3 text-sm focus:ring-2 outline-none ${theme === "dark" ? "bg-transparent border-white/20 text-white" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                >
                  <option value="conflict">Conflict</option>
                  <option value="violence">Violence</option>
                  <option value="tension">Tension</option>
                  <option value="displacement">Displacement</option>
                  <option value="natural disaster">Natural Disaster</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  className={`border p-2 rounded-md w-full mb-3 text-sm focus:ring-2 outline-none ${theme === "dark" ? "bg-transparent border-white/20 text-white" : "bg-gray-50 border-gray-300 text-gray-700"}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input type="text" placeholder="City" value={form.city} readOnly className={`border p-2 rounded-md text-sm ${theme === "dark" ? "bg-transparent border-white/20 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-600"}`} />
                  <input type="text" placeholder="Country" value={form.country} readOnly className={`border p-2 rounded-md text-sm ${theme === "dark" ? "bg-transparent border-white/20 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-600"}`} />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition">
                    {loading ? "Saving..." : "Submit"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration / coins modal (only after success) */}
        <AnimatePresence>
          {showCongratsModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
              {showCoins &&
                [...Array(18)].map((_, i) => (
                  <span
                    key={i}
                    className="coin-shiny"
                    style={{
                      left: `${Math.random() * 95}%`,
                      top: `${Math.random() * 30}%`,
                      animationDelay: `${i * 0.12}s`,
                      background: `radial-gradient(circle at 30% 30%, ${["#fffad1", "#facc15", "#d97706", "#eab308"][i % 4]}, #b45309)`,
                    }}
                  />
                ))}

              <div
                className="relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-11/12 max-w-lg border-8 animate-fadein text-center overflow-hidden pointer-events-auto"
                style={{ borderImage: `linear-gradient(45deg, ${gradientColors.join(", ")}) 1` }}
              >
                <h2 className="text-2xl font-bold text-green-600 mb-2">🎊 Thank you — Report Saved</h2>
                <p className="text-gray-700 mb-2 text-lg">Your report has been received and will help shape early warning alerts.</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Incident cards grid */}
        <motion.div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4" variants={containerVariants} initial="hidden" animate="visible">
          {incidents && incidents.length === 0 && <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>No incidents to show.</p>}

          <AnimatePresence>
            {Array.isArray(incidents) &&
              incidents.map((incident, index) => {
                // defensive fields
                const id = incident?._id || `inc-${index}`;
                const title = safeString(incident?.title);
                const description = safeString(incident?.description);
                const city = safeString(incident?.city);
                const country = safeString(incident?.country);
                const createdAt = incident?.createdAt ? new Date(incident.createdAt).toLocaleString() : "—";
                const category = safeString(incident?.category);
                const severity = safeString(incident?.severity);

                return (
                  <motion.div
                    key={id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                    className={`rounded-lg p-4 border-l-4 transition-all transform hover:-translate-y-1 animate-card-border ${theme === "dark" ? "backdrop-blur-sm bg-[#0f1724]/60 border-white/10" : ""}`}
                    style={{
                      borderColor: borderColors[index % borderColors.length],
                      backgroundColor: theme === "dark" ? "rgba(10,12,18,0.45)" : bgColors[index % bgColors.length],
                    }}
                  >
                    <h3 className="font-bold text-lg" style={{ color: borderColors[index % borderColors.length] }}>
                      {title}
                    </h3>
                    <p className={`mt-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{description}</p>
                    <p className="mt-2 text-sm text-gray-500 italic">
                      {city}, {country} — {createdAt}
                    </p>
                    <div className="flex justify-between text-xs mt-2 text-gray-500">
                      <span>Category: {category}</span>
                      <span>Severity: {severity}</span>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Animations / small helper CSS (copied and adapted from SharePeaceStory) */}
      <style>{`
        @keyframes flyup { 0% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-20px); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        .animate-flyup { animation: flyup 1.2s ease-out forwards; }

        @keyframes fadein { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadein { animation: fadein 0.5s ease-out forwards; }

        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-border { animation: gradientShift 3s ease infinite; }

        @keyframes colorCycle { 0% { border-color: #16a34a; } 25% { border-color: #3b82f6; } 50% { border-color: #f97316; } 75% { border-color: #facc15; } 100% { border-color: #16a34a; } }
        .animate-color-cycle { animation: colorCycle 6s linear infinite; }

        @keyframes pointsFlash { 0%, 100% { background-position: 0% 50%; } 25% { background-position: 100% 50%; } 50% { background-position: 0% 50%; } 75% { background-position: 100% 50%; } }
        .animate-points-flash { animation: pointsFlash 1.2s linear infinite; background-size: 400% 400%; }

        @keyframes fallBounce { 0% { transform: translateY(-100px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateY(500px) rotate(360deg); opacity: 1; } 100% { transform: translateY(550px) rotate(540deg); opacity: 0; } }
        .coin-shiny { position: fixed; top: -50px; width: 28px; height: 28px; border-radius: 50%; z-index: 10000; animation: fallBounce 3.5s ease-in forwards; box-shadow: 0 0 10px rgba(255, 215, 0, 0.7), inset 0 0 4px rgba(255,255,255,0.8); overflow: hidden; }
        .coin-shiny::before { content: ''; position: absolute; top: -100%; left: -100%; width: 200%; height: 200%; background: linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%); animation: glintMove 1.2s linear infinite; }
        @keyframes glintMove { from { transform: translate(-50%, -50%) rotate(45deg); } to { transform: translate(50%, 50%) rotate(45deg); } }

        /* Card border spinning */
        @keyframes cardBorderSpin { 0% { border-image: linear-gradient(0deg, ${gradientColors.join(", ")}) 1; } 100% { border-image: linear-gradient(360deg, ${gradientColors.join(", ")}) 1; } }
        .animate-card-border { animation: cardBorderSpin 6s linear infinite; }
      `}</style>
    </div>
  );
}
