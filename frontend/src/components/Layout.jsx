import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Loader component
const SessionLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 gap-6">
      {/* Peace-Verse logo animation */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-green-400 to-yellow-300 animate-pulse" />

      {/* Text */}
      <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold animate-pulse">
        Checking session...
      </p>

      {/* Animated bouncing dots */}
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

const Layout = () => {
  const { loading } = useAuth();

  if (loading) return <SessionLoader />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Auth Modal */}
      <AuthModal />

      {/* Page content with fade-in */}
      <main className="flex-1 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
