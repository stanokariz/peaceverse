import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import {Header} from "./components/Header";
import {AuthModal} from "./components/AuthModal";

// Pages
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Users from "./pages/Users"
import About from "./pages/About";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
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
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/radio" element={<PeaceRadio />} />
          <Route path="/incidents" element={<AllIncidents />} />
          <Route path="/users" element={<Users />} />

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
          
          // ...other routes
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
          {/* Footer stays consistent across all pages */}
          {/* <Footer /> */}
      </Router>
    </AuthProvider>
  );
}

export default App;
