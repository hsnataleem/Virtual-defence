// src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import logoImg from "./gold.png";

export default function NavBar({ onLogout, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [hidden, setHidden] = useState(false); // <-- For scroll hide
  const navigate = useNavigate();

  // Track scroll direction
  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setHidden(true); // Hide on scroll down
      } else {
        setHidden(false); // Show on scroll up
      }
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserEmail(data.email || user.email);
        setUserPhotoURL(
          data.photoURL && data.photoURL.trim() !== "" ? data.photoURL : null
        );
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { label: "Records", href: "#records" },
    { label: "File Complaint", href: "#complaint" },
    { label: "Recovery Station", href: "#map" },
 
  ];

  return (
    <>
      <style>{`
        nav {
          width: 100%;
          padding: 0.5rem 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5);
          transition: transform 0.3s ease;
        }
        nav.hidden { transform: translateY(-100%); }
        .logo-img { height: 80px; cursor: pointer; transition: transform .3s ease; }
        .logo-img:hover { transform: scale(1.05); }
        .nav-link {
          position: relative;
          padding: 2px 6px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          transition: all .3s ease;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #00fff7, #00ff85, #00aaff);
          transition: width .3s ease;
        }
        .nav-link:hover { color: #00ff85; }
        .nav-link:hover::after { width: 100%; }

       .profile-wrapper { 
  position: relative; 
  margin-right: 25px; /* added small left margin */
}
.profile-img, .default-icon {
  width: 40px; 
  height: 40px; 
  border-radius: 50%;
  border: 2px solid #00ff85; 
  cursor: pointer;
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: rgba(255,255,255,0.1); 
  transition: all .3s ease;
}

        .profile-img:hover, .default-icon:hover { transform: scale(1.1); box-shadow: 0 0 12px rgba(0,255,133,0.7); }

        .profile-dropdown {
          position: absolute;
          top: 50px; right: 0;
          background: rgba(30,30,30,0.97);
          border-radius: 10px; padding: 12px; width: 180px;
          display: flex; flex-direction: column; gap: 10px;
          animation: fadeIn .3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }
        .profile-dropdown span { font-size: 14px; color: #fff; text-align: center; margin-bottom: 6px; opacity: 0.85; }

        .logout-btn { padding: 8px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
          background: linear-gradient(135deg, #ff4c4c, #ff0000); color: white; transition: all .3s ease; }
        .logout-btn:hover { transform: translateY(-2px); box-shadow: 0 0 12px rgba(255,0,0,0.7); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        .mobile-menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .mobile-menu { position: fixed; top: 0; right: 0; width: 250px; height: 100%; background: rgba(20,20,20,0.98);
          backdrop-filter: blur(10px); display: flex; flex-direction: column; padding: 2rem 1rem; gap: 1.5rem;
          animation: slideRight .3s ease forwards; z-index: 50; }
        .mobile-menu .nav-link { font-size: 18px; padding: 10px 8px; }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

        @media (max-width: 768px) { .desktop-nav { display: none; } .mobile-toggle { display: flex; cursor: pointer; } }
        @media (min-width: 769px) { .desktop-nav { display: flex; align-items: center; gap: 24px; } .mobile-toggle { display: none; } }
      `}</style>

      <nav className={hidden ? "hidden" : ""}>
        <img src={logoImg} alt="Logo" className="logo-img" onClick={() => navigate("/")} />

        <div className="desktop-nav">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="nav-link">{item.label}</a>
          ))}

          <div className="profile-wrapper">
            {userPhotoURL ? (
              <img src={userPhotoURL} alt="User" className="profile-img" onClick={() => setDropdownOpen(!dropdownOpen)} />
            ) : (
              <div className="default-icon" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <User size={22} color="#fff" />
              </div>
            )}
            {dropdownOpen && (
              <div className="profile-dropdown">
                <span>{userEmail || "Guest"}</span>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <div className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
        </div>
      </nav>

      {menuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu">
            {navItems.map((item, idx) => (
              <a key={idx} href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button className="logout-btn" onClick={() => { setMenuOpen(false); onLogout(); }}>Logout</button>
          </div>
        </>
      )}
    </>
  );
}