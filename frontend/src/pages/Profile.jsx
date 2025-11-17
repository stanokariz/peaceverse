import { useAuth } from "../context/AuthContext";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png"; // your logo

const Profile = () => {
  const { user } = useAuth();
  const edgeColors = ["#3b82f6", "#10b981", "#f59e0b", "#facc15"]; // blue, green, orange, yellow
  const controls = useAnimation();

  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [currency, setCurrency] = useState("KES");

  // Animate border colors & glowing shadow
  useEffect(() => {
    let index = 0;
    const cycleGlow = () => {
      controls.start({
        borderTopColor: edgeColors[index % edgeColors.length],
        borderLeftColor: edgeColors[(index + 1) % edgeColors.length],
        borderRightColor: edgeColors[(index + 2) % edgeColors.length],
        borderBottomColor: edgeColors[(index + 3) % edgeColors.length],
        boxShadow: `
          0 0 15px ${edgeColors[index % edgeColors.length]},
          0 0 25px ${edgeColors[(index + 1) % edgeColors.length]}55,
          0 0 35px ${edgeColors[(index + 2) % edgeColors.length]}33
        `,
        transition: { duration: 1.5, ease: "easeInOut" },
      });
      index++;
      setTimeout(cycleGlow, 1500);
    };
    cycleGlow();
  }, [controls]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-4 bg-white/20 dark:bg-gray-700/40 backdrop-blur-md rounded-xl shadow-lg text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col justify-start items-center px-4 pt-6 sm:pt-8 bg-gradient-to-b from-amber-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Faded background image */}
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        alt="Decorative"
        className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
      />

      <div className="flex flex-col md:flex-row md:justify-center md:space-x-10 w-full max-w-5xl">
        {/* ====== Profile Card ====== */}
        <motion.div
          animate={controls}
          initial={{
            borderTopColor: edgeColors[0],
            borderLeftColor: edgeColors[1],
            borderRightColor: edgeColors[2],
            borderBottomColor: edgeColors[3],
            boxShadow: `0 0 15px ${edgeColors[0]}, 0 0 25px ${edgeColors[1]}55, 0 0 35px ${edgeColors[2]}33`,
          }}
          className="relative w-full max-w-sm p-6 sm:p-8 rounded-2xl bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg border-4 flex flex-col items-center space-y-6 mb-8 md:mb-0"
        >
          {/* Avatar */}
          <motion.div
            animate={controls}
            initial={{
              borderTopColor: edgeColors[0],
              borderLeftColor: edgeColors[1],
              borderRightColor: edgeColors[2],
              borderBottomColor: edgeColors[3],
              boxShadow: `
                0 0 10px ${edgeColors[0]},
                0 0 20px ${edgeColors[1]}55,
                0 0 30px ${edgeColors[2]}33
              `,
            }}
            className="relative w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-white/40"
          >
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </motion.div>

          <motion.h1
            className="text-xl sm:text-2xl font-bold text-center bg-clip-text text-transparent animate-gradient"
            style={{
              backgroundImage:
                "linear-gradient(270deg, #f59e0b, #10b981, #3b82f6, #f59e0b)",
              backgroundSize: "600% 600%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            {user.email}
          </motion.h1>

          <div className="w-full space-y-3">
            <InfoRow label="Phone Number" value={user.phoneNumber || "—"} controls={controls} />
            <InfoRow label="Role" value={user.role || "—"} controls={controls} />
            <InfoRow label="Peace Points" value={user.newPoints} controls={controls} />
            <InfoRow
              label="Last Login"
              value={
                user.lastLogin
                  ? `${new Date(user.lastLogin).toLocaleDateString()} ${new Date(user.lastLogin).toLocaleTimeString()}`
                  : "—"
              }
              controls={controls}
            />
          </div>
        </motion.div>

        {/* ====== Reward Center Form ====== */}
<motion.div
  className="relative w-full max-w-sm p-6 sm:p-8 rounded-2xl bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg border-4 flex flex-col items-center space-y-6"
>
  <h2 className="text-xl font-bold mb-4">Reward Center</h2>

  {/* Payment Options */}
  <div className="w-full space-y-3">
    <label className="font-semibold">Redeem via:</label>
    {[
      {
        name: "MPESA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg",
      },
      {
        name: "Visa",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg",
      },
      {
        name: "Mastercard",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
      },
      {
        name: "Bitcoin",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg",
      },
      {
        name: "Airtime",
        logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mobile_icon.svg",
      },
    ].map((opt) => (
      <label
        key={opt.name}
        className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
      >
        <input
          type="radio"
          name="withdraw"
          className="w-5 h-5 accent-blue-500"
          value={opt.name}
          checked={withdrawMethod === opt.name}
          onChange={(e) => setWithdrawMethod(e.target.value)}
        />
        <img
          src={opt.logo}
          alt={opt.name}
          className="w-6 h-6 object-contain hover:animate-pulse"
        />
        <span>{opt.name}</span>
      </label>
    ))}
  </div>

  {/* Currency Dropdown */}
  <div className="w-full flex flex-col space-y-1">
    <label className="font-semibold">Currency</label>
    <select
      className={`p-2 rounded border ${
        withdrawMethod === "MPESA"
          ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      }`}
      value={withdrawMethod === "MPESA" ? "KES" : currency}
      onChange={(e) => setCurrency(e.target.value)}
      disabled={withdrawMethod === "MPESA"}
    >
      <option value="KES">KES</option>
      <option value="USD">USD</option>
      <option value="NAIRA">NAIRA</option>
      <option value="TSH">TSH</option>
      <option value="USH">USH</option>
    </select>
  </div>

  {/* Phone Number Input (only for MPESA) */}
  {withdrawMethod === "MPESA" && (
    <div className="w-full flex flex-col space-y-1">
      <label className="font-semibold">Phone Number</label>
      <input
        type="text"
        value={user.phoneNumber || ""}
        disabled
        className="p-2 rounded border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
      />
    </div>
  )}

  {/* Amount Display */}
  <div className="w-full flex flex-col space-y-1">
    <label className="font-semibold">Amount</label>
    <input
      type="text"
      value={user.newPoints}
      disabled
      className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
    />
  </div>

  {/* Withdraw Button */}
  <motion.button
    className="w-full py-2 text-white rounded-lg mt-2"
    style={{
      backgroundImage: "linear-gradient(270deg, #3b82f6, #10b981, #f59e0b, #facc15)",
      backgroundSize: "600% 600%",
      boxShadow: "0 0 10px #3b82f6, 0 0 20px #10b98155, 0 0 30px #f59e0b33",
    }}
    animate={{
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      boxShadow: [
        "0 0 10px #3b82f6,0 0 20px #10b98155,0 0 30px #f59e0b33",
        "0 0 15px #facc15,0 0 25px #3b82f6,0 0 35px #10b98155",
      ],
    }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    Withdraw
  </motion.button>
</motion.div>

      </div>
    </section>
  );
};

/** Info Row Component */
const InfoRow = ({ label, value, controls }) => (
  <motion.div
    animate={controls}
    initial={{
      borderTopColor: "#3b82f6",
      borderLeftColor: "#10b981",
      borderRightColor: "#f59e0b",
      borderBottomColor: "#facc15",
      boxShadow: "0 0 10px #3b82f6, 0 0 20px #10b98155, 0 0 30px #f59e0b33",
    }}
    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className="flex justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-gray-700/30 border-2"
  >
    <span className="font-semibold">{label}:</span>
    <span>{value}</span>
  </motion.div>
);

export default Profile;
