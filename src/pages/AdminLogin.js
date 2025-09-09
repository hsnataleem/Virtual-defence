import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      if (!user) return;
      const docRef = doc(db, "adminRequests", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().status === "approved") {
        setApproved(true);
      } else {
        setApproved(false);
      }
    };
    checkApproval();
  }, [user]);

  useEffect(() => {
    if (approved) {
      navigate("/admin-panel");
    }
  }, [approved, navigate]);

  const requestAdminAccess = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "adminRequests", user.uid), {
        email: user.email,
        requestedAt: new Date(),
        status: "pending",
      });
      setMessage("✅ Admin request sent. Wait for approval.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send admin request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", color:"#fff"}}>
      <h2>Admin Login / Request Access</h2>
      <p>{message}</p>
      {!approved && (
        <button onClick={requestAdminAccess} disabled={loading}>
          {loading ? "Sending..." : "Request Admin Access"}
        </button>
      )}
      <button onClick={() => navigate("/profile")} style={{ marginTop: "10px" }}>
        Back to Profile
      </button>
    </div>
  );
}
