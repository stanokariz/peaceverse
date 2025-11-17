import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";

const AuthContext = createContext();

// ----- CONTROL REFRESH QUEUE -----
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // --------------------------
  // Fetch current user
  // --------------------------
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user || null);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Unexpected user fetch error:", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // AXIOS INTERCEPTOR
  // --------------------------
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;

        // If refresh fails or this is refresh endpoint itself → reject
        if (originalRequest.url.includes("/auth/refresh")) {
          return Promise.reject(err);
        }

        // Handle ONLY 401 errors
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // If already refreshing → queue the request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => api(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          // Begin refresh
          isRefreshing = true;

          try {
            await api.post("/auth/refresh");

            // Process all queued requests
            processQueue(null);

            return api(originalRequest); // retry original request

          } catch (refreshErr) {
            processQueue(refreshErr, null);
            setUser(null);
            toast.error("Session expired. Please log in again.");
            return Promise.reject(refreshErr);

          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(err);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Load user on first mount
  useEffect(() => {
    fetchUser();
  }, []);

  // --------------------------
  // AUTH ACTIONS
  // --------------------------
  const login = async ({ email, password }) => {
    try {
      await api.post("/auth/login", { email, password });
      await fetchUser();
      toast.success("Logged in successfully");
      setAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const signup = async ({ email, phoneNumber, password }) => {
    try {
      await api.post("/auth/signup", { email, phoneNumber, password });
      toast.success("OTP sent to email & phone");
      return { ok: true, nextStep: "emailOTP" };
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const verifyEmailOtp = async ({ email, otp }) => {
    try {
      await api.post("/auth/verify-otp", { email, emailOTP: otp });
      toast.success("Email verified");
      return { ok: true, nextStep: "phoneOTP" };
    } catch (err) {
      const msg = err.response?.data?.message || "Email verification failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const verifyPhoneOtp = async ({ email, otp }) => {
    try {
      await api.post("/auth/verify-phone-otp", { email, phoneOTP: otp });
      toast.success("Phone verified");
      return { ok: true, nextStep: "login" };
    } catch (err) {
      const msg = err.response?.data?.message || "Phone verification failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const forgotPassword = async ({ email }) => {
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent for password reset");
      return { ok: true, nextStep: "reset" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful");
      return { ok: true, nextStep: "login" };
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      setAuthModalOpen(false);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Logout failed";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
        signup,
        verifyEmailOtp,
        verifyPhoneOtp,
        login,
        logout,
        forgotPassword,
        resetPassword,
        authModalOpen,
        setAuthModalOpen,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
