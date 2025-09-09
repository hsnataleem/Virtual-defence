import React from "react";
import NavBar from "../components/NavBar";
import HeroMega from "../components/HeroMega";
import Records from "../components/Records";
import ComplaintForm from "../components/ComplaintForm";
import MapSection from "../components/MapSection";

import GlobalStyles from "../components/GlobalStyles";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ User logged out");
    } catch (err) {
      console.error("❌ Logout error:", err.message);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    color: "white",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: "4rem",
  };

  return (
    <div style={containerStyle}>
      <GlobalStyles />
      <NavBar userEmail={auth.currentUser?.email} onLogout={handleLogout} />
      <main style={{ position: "relative", zIndex: 10 }}>
        <HeroMega />
        <Records />
        <ComplaintForm />
        <MapSection />
      </main>
    </div>
  );
}
