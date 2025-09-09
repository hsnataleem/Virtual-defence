import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "../AuthPage.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("⚠️ Please enter your email first!");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setShowPopup(true);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage(`📩 Password reset link sent to ${email}. Check your inbox.`);
    } catch (err) {
      setMessage("❌ " + (err?.message || "Something went wrong."));
    }
  };

  return (
    <div className="auth-container">
      {/* Stars */}
      <div className="stars">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your account email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <button type="submit" className="auth-btn">
            Send Reset Link
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-toggle">
          Remembered your password?{" "}
          <Link to="/auth" className="auth-link">
            Go back to Login
          </Link>
        </p>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h2 className="auth-title">❌ Email Not Found</h2>
            <p className="auth-message">
              No account exists with this email. Please try again or sign up.
            </p>
            <button className="auth-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
