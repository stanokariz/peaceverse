// components/ProtectedRoute.jsx
import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, setAuthModalOpen, loading } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false); // prevent duplicate toasts per route

  // Reset toastShown when route changes
  useEffect(() => {
    toastShown.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user && !toastShown.current) {
      toastShown.current = true;
      setAuthModalOpen(true); // open login modal
    } else if (
      !loading &&
      user &&
      roles.length > 0 &&
      !roles.includes(user.role) &&
      !toastShown.current
    ) {
      toastShown.current = true;
      toast.error("Access denied");
    }
  }, [user, roles, setAuthModalOpen, loading]);

  if (loading) return null; // wait for user fetch

  // Not logged in → modal handles login, stay on current page but redirect to home if necessary
  if (!user) return <Navigate to="/" replace />;

  // Role restricted → redirect to home
  if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
