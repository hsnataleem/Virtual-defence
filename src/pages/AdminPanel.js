// src/pages/AdminPanel.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  getDoc,
  setDoc,
  limit,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Download, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notification, setNotification] = useState("");
  const [notifyUser, setNotifyUser] = useState("");
  const [sending, setSending] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const navigate = useNavigate();

  // --- admin check useEffect ---
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/auth");
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.isAdmin) setIsAdmin(true);
        } else {
          const q = query(
            collection(db, "users"),
            where("email", "==", user.email),
            limit(1)
          );
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const data = qSnap.docs[0].data();
            if (data.isAdmin) setIsAdmin(true);
            await setDoc(userRef, {
              email: user.email,
              uid: user.uid,
              createdAt: serverTimestamp(),
              isAdmin: !!data.isAdmin,
            });
          } else {
            await setDoc(userRef, {
              email: user.email,
              uid: user.uid,
              isAdmin: false,
              createdAt: serverTimestamp(),
            });
          }
        }
        const rq = query(
          collection(db, "adminRequests"),
          where("uid", "==", user.uid),
          where("status", "==", "pending")
        );
        const rqSnap = await getDocs(rq);
        if (!rqSnap.empty) setRequestSent(true);
      } catch (err) {
        console.error(err);
        alert("❌ Error while checking admin status.");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  // --- realtime data ---
  useEffect(() => {
    if (!isAdmin) return;
    return onSnapshot(collection(db, "adminRequests"), (snap) =>
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "chatHistory"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) =>
      setChatHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
      setComplaints(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || null,
        }))
      )
    );
  }, [isAdmin]);

  // --- functions ---
  const handleRequestUpdate = async (id, status, uid) => {
    await updateDoc(doc(db, "adminRequests", id), { status });
    if (status === "approved") await updateDoc(doc(db, "users", uid), { isAdmin: true });
    alert(`✅ Request ${status}`);
  };

  const handleSendNotification = async () => {
    if (!notification.trim()) return;
    setSending(true);
    await addDoc(collection(db, "notifications"), {
      message: notification,
      userEmail: notifyUser.trim() || "all",
      createdAt: serverTimestamp(),
    });
    setNotification("");
    setNotifyUser("");
    setSending(false);
    alert("✅ Notification sent");
  };

  const updateComplaintStatus = async (id, status, userEmail) => {
    await updateDoc(doc(db, "complaints", id), { status });
    await addDoc(collection(db, "notifications"), {
      message: `Your complaint has been marked as ${status}`,
      userEmail: userEmail || "all",
      createdAt: serverTimestamp(),
    });
  };

  const deleteComplaint = async (id) => {
    await deleteDoc(doc(db, "complaints", id));
    alert("🗑️ Complaint deleted");
  };

  const exportChatPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text("Chat History", 14, 20);
    autoTable(docPDF, {
      startY: 30,
      head: [["User", "Message", "Time"]],
      body: chatHistory.map((c) => [
        c.userEmail || "Unknown",
        c.message || "",
        c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : "",
      ]),
    });
    docPDF.save("chat_history.pdf");
  };

  // --- download resolved complaint PDF ---
  const downloadComplaintPDF = (complaint) => {
    const docPDF = new jsPDF();
    const logo = new Image();
    logo.src = "/gold.png"; // must be in public folder
    logo.onload = () => {
      docPDF.addImage(logo, "PNG", 10, 10, 30, 30);

      // Web name & greeting
      docPDF.setFontSize(18);
      docPDF.text("VIRTUAL DEFENCE SYSTEM", 50, 20);
      docPDF.setFontSize(12);
      docPDF.text(
        "Greetings from Commander! Here is your resolved complaint report:",
        10,
        50
      );

      // Complaint details
      autoTable(docPDF, {
        startY: 60,
        head: [["Crime Type", "Description", "User", "Status", "Date"]],
        body: [
          [
            complaint.crimeType || "N/A",
            complaint.description || "N/A",
            complaint.user || "Unknown",
            complaint.status || "N/A",
            complaint.createdAt?.toLocaleString() || "N/A",
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        bodyStyles: { fillColor: [31, 31, 46], textColor: [255, 255, 255] },
      });

      docPDF.save(`complaint_${complaint.id}.pdf`);
    };
  };

  // --- premium dark theme ---
  const sidebar = {
    width: "260px",
    height: "100vh",
    padding: "2rem 1rem",
    position: "fixed",
    top: 0,
    left: 0,
    background: "#1e1e2f",
    color: "#f1f1f1",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    boxShadow: "2px 0 12px rgba(0,0,0,0.3)",
  };

  const main = {
    marginLeft: "260px",
    padding: "2rem",
    minHeight: "100vh",
    background: "#121212",
    color: "#f1f1f1",
    width: "100%",
  };

  const button = {
    padding: "0.6rem 1rem",
    margin: "0.3rem 0",
    border: "none",
    borderRadius: "6px",
    background: "transparent",
    color: "#f1f1f1",
    textAlign: "left",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const activeButton = {
    ...button,
    background: "#4f46e5",
    color: "#fff",
  };

  const card = {
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1rem",
    background: "#1f1f2e",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (!isAdmin)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>ACCESS DENIED</h1>
        {requestSent ? (
          <p>✅ Admin request sent</p>
        ) : (
          <button
            onClick={async () => {
              const user = auth.currentUser;
              await addDoc(collection(db, "adminRequests"), {
                uid: user.uid,
                email: user.email,
                status: "pending",
                requestedAt: serverTimestamp(),
              });
              setRequestSent(true);
            }}
            style={{ ...button, fontWeight: "bold", background: "#4f46e5", color: "#fff" }}
          >
            REQUEST ADMIN ACCESS
          </button>
        )}
      </div>
    );

  return (
    <div>
      {/* Sidebar */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: "1rem" }}>⚡ ADMIN PANEL</h2>
        {["dashboard", "requests", "chats", "complaints", "notifications"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? activeButton : button}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={main}>
        {activeTab === "dashboard" && (
          <div>
            <h1>SYSTEM DASHBOARD</h1>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={card}>
                <h3>Admin Requests</h3>
                <p>{requests.length}</p>
              </div>
              <div style={card}>
                <h3>Total Chats</h3>
                <p>{chatHistory.length}</p>
              </div>
              <div style={card}>
                <h3>Total Complaints</h3>
                <p>{complaints.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chats" && (
          <div>
            <h1>CHAT LOGS</h1>
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search logs..."
              style={{
                padding: "0.5rem",
                border: "1px solid #4f46e5",
                borderRadius: "6px",
                width: "60%",
                marginRight: "1rem",
                background: "#1f1f2e",
                color: "#f1f1f1",
              }}
            />
            <button onClick={exportChatPDF} style={{ ...button, background: "#4f46e5", color: "#fff" }}>
              <Download size={16} style={{ marginRight: "5px" }} />
              EXPORT PDF
            </button>
            <div style={{ marginTop: "1rem", maxHeight: "400px", overflowY: "auto" }}>
              {chatHistory
                .filter(
                  (c) =>
                    c.userEmail?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                    c.message?.toLowerCase().includes(chatSearch.toLowerCase())
                )
                .map((c) => (
                  <div key={c.id} style={card}>
                    <strong>{c.userEmail || "Unknown"}</strong>
                    <p>{c.message}</p>
                    <small>
                      {c.timestamp?.toDate
                        ? c.timestamp.toDate().toLocaleString()
                        : ""}
                    </small>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div>
            <h1>COMPLAINTS DATABASE</h1>
            {complaints.map((c) => (
              <div key={c.id} style={card}>
                <h3>{c.crimeType}</h3>
                <p>{c.description}</p>
                <small>
                  By {c.user} | {c.createdAt?.toLocaleString() || "N/A"}
                </small>
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <select
                    value={c.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await updateComplaintStatus(c.id, newStatus, c.user);
                      setComplaints((prev) =>
                        prev.map((comp) =>
                          comp.id === c.id ? { ...comp, status: newStatus } : comp
                        )
                      );
                    }}
                    style={{
                      padding: "0.3rem",
                      borderRadius: "6px",
                      border: "1px solid #4f46e5",
                      background: "#1f1f2e",
                      color: "#f1f1f1",
                    }}
                  >
                    <option>Pending</option>
                    <option>In Review</option>
                    <option>Resolved</option>
                  </select>

                  {c.status === "Resolved" && (
                    <>
                      <button
                        onClick={() => deleteComplaint(c.id)}
                        style={{ ...button, background: "#e03e3e", color: "#fff" }}
                      >
                        <Trash2 size={16} /> DELETE
                      </button>

                      <button
                        onClick={() => downloadComplaintPDF(c)}
                        style={{ ...button, background: "#4f46e5", color: "#fff" }}
                      >
                        <Download size={16} style={{ marginRight: "5px" }} />
                        DOWNLOAD PDF
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h1>SEND BROADCAST</h1>
            <input
              type="text"
              value={notifyUser}
              onChange={(e) => setNotifyUser(e.target.value)}
              placeholder="User email (leave blank for all)"
              style={{ ...button, width: "50%", background: "#1f1f2e", marginBottom: "0.5rem" }}
            />
            <textarea
              value={notification}
              onChange={(e) => setNotification(e.target.value)}
              placeholder="Your notification message"
              style={{ ...button, width: "50%", height: "100px", background: "#1f1f2e" }}
            />
            <br />
            <button
              onClick={handleSendNotification}
              style={{ ...button, background: "#4f46e5", color: "#fff", marginTop: "0.5rem" }}
              disabled={sending}
            >
              SEND
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
