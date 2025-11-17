import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    signup,
    verifyEmailOtp,
    verifyPhoneOtp,
    login,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const modalRef = useRef();

  // -------------------------
  // Reset inputs on modal close
  // -------------------------
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

  // -------------------------
  // Reset inputs when moving between steps
  // -------------------------
  useEffect(() => {
    // Always clear OTP
    if (step === "emailOTP" || step === "phoneOTP") setOtp("");
    // Clear password in OTP steps
    if (step === "emailOTP" || step === "phoneOTP") setPassword("");
    // Clear phone and password on signup
    if (step === "signup") {
      setPassword("");
      setPhone("");
      setOtp("");
    }
    // Clear password and OTP on login/forgot/reset
    if (step === "login" || step === "forgot" || step === "reset") {
      setPassword("");
      setOtp("");
    }
  }, [step]);

  // -------------------------
  // Close modal on outside click
  // -------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setAuthModalOpen(false);
      }
    };
    if (authModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [authModalOpen, setAuthModalOpen]);

  // -------------------------
  // Spinner & ActionButton
  // -------------------------
  const Spinner = () => (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
  );

  const handleAction = async (actionFn, nextStep = null) => {
    setLoading(true);
    const res = await actionFn();
    setLoading(false);
    if (res?.ok && nextStep) setStep(nextStep);
  };

  const ActionButton = ({ onClick, text, colorClass, nextStep }) => (
    <button
      onClick={() => handleAction(onClick, nextStep)}
      disabled={loading}
      className={`font-semibold p-2 rounded-lg mt-2 w-full flex justify-center items-center transition-all duration-200 shadow-md ${
        loading ? "bg-gray-400 text-gray-700" : `bg-white ${colorClass} hover:scale-105`
      }`}
    >
      {loading && <Spinner />}
      {loading ? `${text}...` : text}
    </button>
  );

  if (!authModalOpen) return null;

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-600 via-green-500 to-yellow-400 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-4 text-white"
          >
            {/* LOGIN */}
            {step === "login" && (
              <>
                <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <ActionButton
                  onClick={() => login({ email, password })}
                  text="Login"
                  colorClass="text-blue-700"
                />
                <div className="flex justify-between text-sm mt-2">
                  <button onClick={() => setStep("signup")} disabled={loading}>
                    Create Account
                  </button>
                  <button onClick={() => setStep("forgot")} disabled={loading}>
                    Forgot Password?
                  </button>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="mt-3 text-white/80 underline w-full text-center"
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}

            {/* SIGNUP */}
            {step === "signup" && (
              <>
                <h2 className="text-2xl font-bold text-center">Create Account</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <ActionButton
                  onClick={() => signup({ email, phoneNumber: phone, password })}
                  text="Signup"
                  colorClass="text-green-700"
                  nextStep="emailOTP"
                />
                <button
                  onClick={() => setStep("login")}
                  className="mt-2 text-white/80 underline w-full text-center"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </>
            )}

            {/* EMAIL OTP */}
            {step === "emailOTP" && (
              <>
                <h2 className="text-2xl font-bold text-center">Verify Email OTP</h2>
                <input
                  type="text"
                  placeholder="Enter Email OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <ActionButton
                  onClick={() => verifyEmailOtp({ email, otp })}
                  text="Verify Email"
                  colorClass="text-purple-700"
                  nextStep="phoneOTP"
                />
              </>
            )}

            {/* PHONE OTP */}
            {step === "phoneOTP" && (
              <>
                <h2 className="text-2xl font-bold text-center">Verify Phone OTP</h2>
                <input
                  type="text"
                  placeholder="Enter Phone OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <ActionButton
                  onClick={() => verifyPhoneOtp({ email, otp })}
                  text="Verify Phone"
                  colorClass="text-indigo-700"
                  nextStep="login"
                />
              </>
            )}

            {/* FORGOT PASSWORD */}
            {step === "forgot" && (
              <>
                <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <ActionButton
                  onClick={() => forgotPassword({ email })}
                  text="Send OTP"
                  colorClass="text-yellow-700"
                  nextStep="reset"
                />
                <button
                  onClick={() => setStep("login")}
                  className="mt-2 text-white/80 underline w-full text-center"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </>
            )}

            {/* RESET PASSWORD */}
            {step === "reset" && (
              <>
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <ActionButton
                  onClick={() => resetPassword({ email, otp, newPassword: password })}
                  text="Reset Password"
                  colorClass="text-red-700"
                  nextStep="login"
                />
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
