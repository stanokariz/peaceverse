import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    login,
    signup,
    verifyEmailOtp,
    verifyPhoneOtp,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState("login"); // login | signup | emailOTP | phoneOTP | forgot | reset
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // <-- new loading state

  const modalRef = useRef();

  // Close modal on clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setAuthModalOpen(false);
      }
    };
    if (authModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [authModalOpen, setAuthModalOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!authModalOpen) {
      setStep("login");
      setEmail("");
      setPhone("");
      setPassword("");
      setOtp("");
      setLoading(false);
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  // Handlers with loading
  const handleAction = async (actionFn) => {
    setLoading(true);
    await actionFn();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-500 via-green-400 to-yellow-300 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 rounded-xl w-full max-w-md shadow-xl flex flex-col gap-3"
          >
            {step === "login" && (
              <>
                <h2 className="text-2xl font-bold text-white">Login</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => login({ email, password }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-blue-600"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <div className="flex justify-between mt-2 text-white text-sm">
                  <button onClick={() => setStep("signup")} disabled={loading}>
                    Signup
                  </button>
                  <button onClick={() => setStep("forgot")} disabled={loading}>
                    Forgot Password?
                  </button>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="mt-2 text-white underline"
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}

            {step === "signup" && (
              <>
                <h2 className="text-2xl font-bold text-white">Signup</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => signup({ email, phoneNumber: phone, password }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-green-600"
                  }`}
                >
                  {loading ? "Signing up..." : "Signup"}
                </button>
                <button onClick={() => setStep("login")} className="mt-2 text-white underline" disabled={loading}>
                  Back to Login
                </button>
              </>
            )}

            {step === "emailOTP" && (
              <>
                <h2 className="text-2xl font-bold text-white">Verify Email OTP</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => verifyEmailOtp({ email, otp }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-purple-600"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </>
            )}

            {step === "phoneOTP" && (
              <>
                <h2 className="text-2xl font-bold text-white">Verify Phone OTP</h2>
                <input
                  type="text"
                  placeholder="Enter Phone OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => verifyPhoneOtp({ email, phoneOTP: otp }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-indigo-600"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify Phone"}
                </button>
              </>
            )}

            {step === "forgot" && (
              <>
                <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => forgotPassword({ email }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-yellow-600"
                  }`}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === "reset" && (
              <>
                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAction(() => resetPassword({ email, otp, newPassword: password }))}
                  disabled={loading}
                  className={`font-bold p-2 rounded mt-2 w-full ${
                    loading ? "bg-gray-400 text-gray-700" : "bg-white text-red-600"
                  }`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
