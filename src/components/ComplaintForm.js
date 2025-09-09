import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth } from "../firebase";
import {
  IdCard,
  Phone,
  User,
  Calendar,
  FileText,
  ShieldAlert,
  Download,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Lottie from "lottie-react";
import loadingAnimation from "./Face scanning.json";
import "./ComplaintForm.css";

export default function ComplaintForm() {
  const [form, setForm] = useState({
    cnic: "",
    phone: "",
    fullName: "",
    dob: "",
    crimeType: "",
    description: "",
    fileUrl: "",
    status: "Pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ type: "", date: "" });
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Virtual Defence System - Complaint Copy", 14, 20);

    doc.setFontSize(11);
    doc.text(`Filed by: ${auth.currentUser?.email || "Guest"}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 42);

    autoTable(doc, {
      startY: 55,
      head: [["Field", "Details"]],
      body: [
        ["Full Name", form.fullName],
        ["CNIC", form.cnic],
        ["Phone", form.phone],
        ["Date of Birth", form.dob],
        ["Crime Type", form.crimeType],
        ["Description", form.description],
        ["Status", form.status],
        ["File", form.fileUrl || "N/A"],
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [250, 204, 21] },
    });

    doc.save("complaint_softcopy.pdf");
  };

  // submit complaint
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "complaints"), {
        ...form,
        createdAt: serverTimestamp(),
        user: auth.currentUser?.email || "Guest",
      });

      setSubmitted(true);
      setForm({
        cnic: "",
        phone: "",
        fullName: "",
        dob: "",
        crimeType: "",
        description: "",
        fileUrl: "",
        status: "Pending",
      });

      setNotification("✅ Complaint submitted successfully!");
      setTimeout(() => setNotification(""), 4000);
      setTimeout(() => generatePDF(), 100);

      fetchComplaints();
    } catch (error) {
      console.error("❌ Error submitting complaint: ", error);
      setNotification("❌ Failed to submit complaint. Try again.");
      setTimeout(() => setNotification(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // fetch complaints
  const fetchComplaints = async () => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((docSnap) => {
      const complaint = docSnap.data();
      return {
        id: docSnap.id,
        ...complaint,
        createdAt: complaint.createdAt ? complaint.createdAt.toDate() : null,
      };
    });
    setComplaints(data);
  };

  // update complaint status
  const updateStatus = async (id, newStatus) => {
    const complaintRef = doc(db, "complaints", id);
    await updateDoc(complaintRef, { status: newStatus });
    fetchComplaints();
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <section id="complaint" className="complaint-section">
      <form className="complaint-box" onSubmit={handleComplaintSubmit}>
        <h2 className="complaint-title">File a Complaint</h2>

        {notification && (
          <div
            className={`notification ${
              notification.startsWith("✅")
                ? "notification-success"
                : "notification-error"
            }`}
          >
            {notification}
          </div>
        )}

        {/* Input Fields */}
        <div className="input-wrapper">
          <IdCard size={20} className="input-icon" />
          <input
            name="cnic"
            placeholder="CNIC"
            value={form.cnic}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="input-wrapper">
          <Phone size={20} className="input-icon" />
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="input-wrapper">
          <User size={20} className="input-icon" />
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="input-wrapper">
          <Calendar size={20} className="input-icon" />
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="input-wrapper">
          <ShieldAlert size={20} className="input-icon" />
          <select
            name="crimeType"
            value={form.crimeType}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select Crime Type</option>
            <option>Theft</option>
            <option>Fraud</option>
            <option>Cyber Crime</option>
            <option>Assault</option>
          </select>
        </div>

        <div className="input-wrapper">
          <FileText size={20} className="input-icon" />
          <textarea
            name="description"
            placeholder="Complaint Description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Complaint"}
        </button>

        {submitted && (
          <button
            type="button"
            className="download-btn"
            onClick={generatePDF}
          >
            <Download size={18} style={{ marginRight: "6px" }} />
            Download Softcopy 📄
          </button>
        )}
      </form>

      {/* Lottie Loader */}
      {submitting && (
        <div className="lottie-overlay">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      )}

      {/* Toggle History Button */}
      <div className="history-toggle">
        <button
          className="history-btn"
          onClick={() => setShowHistory((prev) => !prev)}
        >
          <History size={18} style={{ marginRight: "6px" }} />
          {showHistory ? "Hide Complaint History" : "Show Complaint History"}
          {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Complaint History (only visible if showHistory === true) */}
      {showHistory && (
        <div className="complaint-history modern-box">
          <h3 className="history-title">📂 Complaint History</h3>

          {/* Filters */}
          <div className="filters modern-filters">
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="filter-select"
            >
              <option value="">All Types</option>
              <option>Theft</option>
              <option>Fraud</option>
              <option>Cyber Crime</option>
              <option>Assault</option>
            </select>

            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date: e.target.value }))
              }
              className="filter-date"
            />

            <button onClick={fetchComplaints} className="refresh-btn">
              Refresh 🔄
            </button>
          </div>

          {/* Modern Complaint Cards */}
          <div className="complaint-list modern-list">
            {complaints
              .filter((c) =>
                filters.type ? c.crimeType === filters.type : true
              )
              .filter((c) =>
                filters.date && c.createdAt
                  ? c.createdAt.toISOString().slice(0, 10) === filters.date
                  : true
              )
              .map((c) => (
                <div
                  key={c.id}
                  className={`complaint-card status-${c.status?.toLowerCase()}`}
                >
                  <div className="card-header">
                    <span className="crime-type">{c.crimeType}</span>
                    <span className="status-badge">{c.status}</span>
                  </div>

                  <p className="complaint-desc">{c.description}</p>

                  <div className="card-footer">
                    <small>
                      Filed by: <strong>{c.user}</strong> |{" "}
                      {c.createdAt
                        ? c.createdAt.toLocaleString()
                        : "Date: N/A"}
                    </small>

                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                      className="status-select"
                    >
                      <option>Pending</option>
                      <option>In Review</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
