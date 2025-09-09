import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import "../AuthPage.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Logged in successfully!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 🔥 Save to Firestore with role
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: "user", // default role
        });

        setMessage("🎉 Account created successfully!");
        setIsLogin(true);
      }
    } catch (err) {
      setMessage("❌ " + (err?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // ✅ Ensure user saved in Firestore
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          email: result.user.email,
          role: "user",
        },
        { merge: true }
      );

      setMessage("✅ Logged in with Google!");
    } catch (err) {
      setMessage("❌ " + (err?.message || "Google login failed"));
    } finally {
      setLoading(false);
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
        <h2 className="auth-title">{isLogin ? "Login" : "Signup"}</h2>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        {isLogin && (
          <div style={{ marginTop: "0.5rem" }}>
            <Link className="forgot-password" to="/forgot-password">
              Forgot Password?
            </Link>
          </div>
        )}

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="auth-link"
            onClick={() => setIsLogin((v) => !v)}
            disabled={loading}
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </p>

        <div className="social-login">
          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="google-icon"
            />
            {loading ? "Please wait..." : "Login with Google"}
          </button>

          <button
            className="email-btn"
            onClick={(e) => {
              e.preventDefault();
              setMessage("📧 Use the email/password form above.");
            }}
          >
            Continue with Email
          </button>
        </div>
      </div>
    </div>
  );
}
