import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SharePeaceStory() {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null, city: "", country: "" });
  const [points, setPoints] = useState(user?.newPoints || 0);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // Colors for cards and gradients
  const borderColors = ["#16a34a", "#3b82f6", "#f97316", "#facc15"];
  const bgColors = ["#f0fdf4", "#eff6ff", "#fff7ed", "#fefce8"];
  const gradientColors = ["#16a34a", "#3b82f6", "#f97316", "#facc15"];

  // 🌍 Fetch geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setLocation({
            lat,
            lng,
            city: data.address.city || data.address.town || data.address.village || "",
            country: data.address.country || "",
          });
        } catch {
          toast.error("Failed to get location details");
        }
      },
      (err) => toast.error("Location error: " + err.message)
    );
  }, []);

  // 🧾 Fetch stories
  const fetchStories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/peace-stories/user/${user._id}`);
      setStories(res.data);
    } catch {
      toast.error("Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    setPoints(user?.newPoints || 0);
  }, [user]);

  // Animate points counter
  const animatePointsCount = (target) => {
    let start = 0;
    const step = target / 20;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setDisplayedPoints(Math.floor(start));
    }, 80);
  };

  // Submit story
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and message required");
    if (!location.lat || !location.lng) return toast.error("Fetching location...");

    try {
      const res = await api.post("/peace-stories", {
        title,
        message,
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        country: location.country,
      });

      setStories([res.data.story, ...stories]);
      setPoints(res.data.newPoints);
      setDisplayedPoints(0);
      animatePointsCount(10);
      setShowPointsAnimation(true);
      setTimeout(() => setShowPointsAnimation(false), 1200);
      setShowCongratsModal(true);
      setTimeout(() => setShowCongratsModal(false), 5000);

      setTitle("");
      setMessage("");
      setModalOpen(false);
      toast.success("🎉 Story added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to share story");
    }
  };

  // Redeem points click
  const handlePointsClick = () => {
    if (redeeming) return;
    setRedeeming(true);
    navigate("/profile");
  };

  return (
    <div className="p-4 max-w-[1400px] mx-auto relative" style={{ backgroundColor: "#f9fafb" }}>
      {/* Falling coins background */}
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <span
            key={i}
            className="falling-coin"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              background: `radial-gradient(circle at 30% 30%, #fffad1, #facc15, #d97706)`,
            }}
          ></span>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 rounded-full text-white font-bold animate-gradient-border shadow-lg transition-transform hover:scale-105"
          onClick={() => setModalOpen(true)}
          style={{
            background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
            backgroundSize: "400% 400%",
            animation: "gradientShift 3s ease infinite",
          }}
        >
          Add Story
        </button>

        <div className="relative">
          <button
            onClick={handlePointsClick}
            disabled={redeeming}
            className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
              redeeming ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            } animate-points-flash text-white`}
          >
            Points: {points}
          </button>
          {showPointsAnimation && (
            <span className="absolute -top-6 right-0 text-green-400 font-bold animate-flyup">
              +10
            </span>
          )}
        </div>
      </div>

      {/* Add Story Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border-4 animate-color-cycle">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
              Share Your Peace Story
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                required
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 resize-none"
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎉 Congratulations Modal */}
      {showCongratsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <span
              key={i}
              className="coin-shiny"
              style={{
                left: `${Math.random() * 95}%`,
                top: `${Math.random() * 30}%`,
                animationDelay: `${i * 0.25}s`,
                background: `radial-gradient(circle at 30% 30%, ${
                  ["#fffad1", "#facc15", "#d97706", "#eab308"][i % 4]
                }, #b45309)`,
              }}
            ></span>
          ))}
          <div
            className="relative bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-11/12 max-w-lg border-8 animate-fadein text-center overflow-hidden"
            style={{ borderImage: `linear-gradient(45deg, ${gradientColors.join(", ")}) 1` }}
          >
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎊 Congratulations!</h2>
            <p className="text-gray-700 mb-4 text-lg">
              You earned{" "}
              <span className="font-bold text-yellow-500 text-3xl">{displayedPoints}</span> coins!
            </p>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {loading ? (
        <p>Loading stories...</p>
      ) : (
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <div
              key={story._id}
              className="rounded-lg p-4 border-l-4 hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-[1.02] animate-card-border"
              style={{
                borderColor: borderColors[index % borderColors.length],
                backgroundColor: bgColors[index % bgColors.length],
              }}
            >
              <h3 className="font-bold text-lg" style={{ color: borderColors[index % borderColors.length] }}>
                {story.title}
              </h3>
              <p className="mt-2 text-gray-700">{story.message}</p>
              <p className="mt-2 text-sm text-gray-500 italic">
                {story.city}, {story.country} — {new Date(story.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes flyup { 0% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-20px); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        .animate-flyup { animation: flyup 1.2s ease-out forwards; }

        @keyframes fadein { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-fadein { animation: fadein 0.6s ease-out forwards; }

        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-border { animation: gradientShift 3s ease infinite; }

        @keyframes colorCycle { 0% { border-color: #16a34a; } 25% { border-color: #3b82f6; } 50% { border-color: #f97316; } 75% { border-color: #facc15; } 100% { border-color: #16a34a; } }
        .animate-color-cycle { animation: colorCycle 6s linear infinite; }

        @keyframes pointsFlash { 0%, 100% { background-position: 0% 50%; } 25% { background-position: 100% 50%; } 50% { background-position: 0% 50%; } 75% { background-position: 100% 50%; } }
        .animate-points-flash { animation: pointsFlash 1.2s linear infinite; background: linear-gradient(90deg, ${gradientColors.join(", ")}); background-size: 400% 400%; }

        @keyframes fallBounce { 0% { transform: translateY(-100px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 80% { transform: translateY(500px) rotate(360deg); opacity: 1; } 100% { transform: translateY(550px) rotate(540deg); opacity: 0; } }
        .coin-shiny { position: fixed; top: -50px; width: 28px; height: 28px; border-radius: 50%; z-index: 10000; animation: fallBounce 3.5s ease-in forwards; box-shadow: 0 0 10px rgba(255, 215, 0, 0.7), inset 0 0 4px rgba(255,255,255,0.8); overflow: hidden; }
        .coin-shiny::before { content: ''; position: absolute; top: -100%; left: -100%; width: 200%; height: 200%; background: linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%); animation: glintMove 1.2s linear infinite; }
        @keyframes glintMove { from { transform: translate(-50%, -50%) rotate(45deg); } to { transform: translate(50%, 50%) rotate(45deg); } }

        /* Falling background coins */
        @keyframes fallCoin { 0% { transform: translateY(-50px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 1; } }
        .falling-coin { position: absolute; top: -50px; width: 24px; height: 24px; border-radius: 50%; z-index: 0; animation-name: fallCoin; animation-timing-function: ease-in; animation-iteration-count: infinite; box-shadow: 0 0 10px rgba(255, 215, 0, 0.7), inset 0 0 4px rgba(255,255,255,0.8); overflow: hidden; }

        /* Card border spinning */
        @keyframes cardBorderSpin { 0% { border-image: linear-gradient(0deg, ${gradientColors.join(", ")}) 1; } 100% { border-image: linear-gradient(360deg, ${gradientColors.join(", ")}) 1; } }
        .animate-card-border { animation: cardBorderSpin 6s linear infinite; }
      `}</style>
    </div>
  );
}
