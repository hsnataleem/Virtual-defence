import React, { useState, useEffect } from "react";
import {
  Camera,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../ProfilePage.css";

export default function ProfilePage() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/120");
  const [previewFile, setPreviewFile] = useState(null);
  const [animatePic, setAnimatePic] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username || "");
          setProfilePic(data.photoURL || "https://via.placeholder.com/120");
          setIsAdmin(data.isAdmin === true);
        }

        const userBadges = [
          { name: "Verified User", icon: <ShieldCheck size={16} /> },
          { name: "Top Contributor", icon: <Award size={16} /> },
          { name: "Active Member", icon: <ShieldCheck size={16} /> },
        ];
        setBadges(userBadges);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimatePic(true);
      setProfilePic(reader.result);
      setTimeout(() => setAnimatePic(false), 500);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let photoURL = profilePic;
      if (previewFile) {
        const formData = new FormData();
        formData.append("file", previewFile);

        const res = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        if (data.url) photoURL = data.url;
      }

      await setDoc(
        doc(db, "users", user.uid),
        { username, email: user.email, photoURL },
        { merge: true }
      );

      alert("✅ Profile saved!");
      setPreviewFile(null);
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("Error saving profile!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const goToAdmin = () => {
    if (isAdmin) {
      navigate("/admin-panel");
    } else {
      navigate("/admin-login");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-header">Profile</h2>
        <div className="profile-pic-wrapper">
          <img src={profilePic} alt="Profile" className={`profile-pic ${animatePic ? "animate" : ""}`} />
          <label className="camera-btn">
            <Camera size={18} />
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>

        <input
          type="text"
          className="profile-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <input
          type="email"
          className="profile-input disabled"
          value={user?.email || ""}
          disabled
        />

        {badges.length > 0 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1rem" }}>
            {badges.map((badge, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#6b21a8",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  color: "#fff",
                }}
              >
                {badge.icon} <span>{badge.name}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave} className="profile-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>

        <div className="profile-menu">
          <button className="menu-item" onClick={goToAdmin}>
            <User className="menu-icon" />
            <span>Admin Panel</span>
            <ChevronRight className="chevron" />
          </button>
          <button className="menu-item logout" onClick={handleLogout}>
            <LogOut className="menu-icon" />
            <span>Log Out</span>
            <ChevronRight className="chevron" />
          </button>
        </div>
      </div>
    </div>
  );
}
