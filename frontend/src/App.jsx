import { useState } from "react";
import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";

// Pages
import Home from "./pages/Home";
import Users from "./pages/Users";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Analytics from "./pages/Analytics";
import PeaceRadio from "./pages/PeaceRadio";
import AllIncidents from "./pages/AllIncidents";
import Admin from "./pages/Admin";
import SharePeaceStory from "./pages/SharePeaceStory";
import ReportIncident from "./pages/ReportIncident";

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Header setAuthModalOpen={setAuthModalOpen} />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />

        <Toaster position="top-right" />

        <div className="pt-20">
          <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/radio" element={<PeaceRadio />} />
          <Route path="/incidents" element={<AllIncidents />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* <Route path="/users" element={<Users />} /> */}

          {/* Protected pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute setAuthModalOpen={setAuthModalOpen}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/peace-story"
            element={
              <ProtectedRoute setAuthModalOpen={setAuthModalOpen}>
                <SharePeaceStory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-incident"
            element={
              <ProtectedRoute setAuthModalOpen={setAuthModalOpen}>
                <ReportIncident />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor"
            element={
              <ProtectedRoute roles={["editor", "admin"]} setAuthModalOpen={setAuthModalOpen}>
                <Editor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]} setAuthModalOpen={setAuthModalOpen}>
                <Admin />
              </ProtectedRoute>
            }
          />

           <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]} setAuthModalOpen={setAuthModalOpen}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>

        {/* Optional Footer */}
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
