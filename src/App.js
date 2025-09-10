import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/ProfilePage";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import GlobalStyles from "./components/GlobalStyles";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setIsAdmin(data.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 4}s`,
    }));
    setParticles(generated);

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <GlobalStyles />

      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/home" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/home"
          element={user ? <HomePage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage isAdmin={isAdmin} /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/admin-login"
          element={user && !isAdmin ? <AdminLogin /> : <Navigate to="/home" replace />}
        />
        <Route
          path="/admin-panel"
          element={user && isAdmin ? <AdminPanel /> : <Navigate to="/home" replace />}
        />
        <Route path="*" element={<Navigate to={user ? "/home" : "/auth"} replace />} />
      </Routes>
    </Router>
  );
}
