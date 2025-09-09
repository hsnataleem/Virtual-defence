// src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react"; // User icon import
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import logoImg from "./gold.png"; // <- Add your PNG logo here

export default function NavBar({ onLogout, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState(null); // ✅ null instead of ""
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserEmail(data.email || user.email);
        setUserPhotoURL(
          data.photoURL && data.photoURL.trim() !== "" ? data.photoURL : null
        ); // ✅ stable fallback
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { label: "Records", href: "#records" },
    { label: "File Complaint", href: "#complaint" },
    { label: "Recovery Station", href: "#map" },
    ...(isAdmin ? [{ label: "Owner Dashboard", href: "/owner-dashboard" }] : []),
  ];

  return (
    <>
      <style>{`
          nav {
            width: 100%;
            padding: 0rem 0rem;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 20px 100px rgba(0,0,0,0.5);
          }
          .logo-img {
            height: 100px;
            cursor: pointer;
            transition: transform .3s ease;
          }
          .logo-img:hover { transform: scale(1.05); }
          .nav-link {
            position: relative;
            padding: 6px 16px;
            font-weight: 500;
            color: #ffffffcc;
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
          .profile-wrapper { position: relative; }
          .profile-img, .default-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 2px solid #00ff85;
            cursor: pointer;
            transition: all .3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.1);
          }
          .profile-img:hover, .default-icon:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 0 14px rgba(0,255,133,0.7);
          }
          .profile-dropdown {
            position: absolute;
            top: 55px;
            right: 0;
            background: rgba(30,30,30,0.97);
            border-radius: 12px;
            padding: 12px;
            width: 200px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            animation: fadeIn .3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          }
          .profile-dropdown span {
            font-size: 14px;
            color: #fff;
            text-align: center;
            margin-bottom: 6px;
            opacity: 0.85;
          }
          .logout-btn {
            padding: 8px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #ff4c4c, #ff0000);
            color: white;
            transition: all .3s ease;
          }
          .logout-btn:hover {
            box-shadow: 0 0 14px rgba(255,0,0,0.7);
            transform: translateY(-2px);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 768px) {
            .desktop-nav { display: none; }
            .mobile-toggle { display: flex; }
          }
          @media (min-width: 769px) {
            .desktop-nav { display: flex; }
            .mobile-toggle { display: none; }
          }
          .mobile-menu {
            position: fixed;
            inset: 0;
            background: rgba(20,20,20,0.98);
            backdrop-filter: blur(18px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            animation: slideDown .3s ease forwards;
            z-index: 100;
          }
          .mobile-menu .nav-link { font-size: 20px; }
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        `}</style>

      <nav>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          {/* Logo */}
          <img
            src={logoImg}
            alt="Virtual Defence Logo"
            className="logo-img"
            onClick={() => navigate("/")}
          />

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
            {navItems.map((item, idx) => (
              <a key={idx} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}

            {/* Profile */}
            <div className="profile-wrapper">
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt="User"
                  className="profile-img"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
              ) : (
                <div
                  className="default-icon"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
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

          {/* Mobile Toggle */}
          <div
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: "pointer" }}
          >
            {menuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      )}
    </>
  );
}
