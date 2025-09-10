import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={position}>
      <Popup>🚓 Selected Location</Popup>
    </Marker>
  );
}

function Recenter({ position }) {
  const map = useMap();
  map.setView(position, 13);
  return null;
}

export default function MapSection() {
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const stations = {
    Islamabad: [33.6844, 73.0479],
    Lahore: [31.5497, 74.3436],
    Karachi: [24.8607, 67.0011],
  };

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = async () => {
    if (!search) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          search
        )}`
      );
      const data = await res.json();
      if (data && data[0]) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("⚠️ Location not found!");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <section
      id="map"
      style={{
        padding: "2rem 1rem",
        color: "#fff",
      }}
    >
      <h2
        style={{
          fontSize: "2rem",
          marginBottom: "2rem",
          textAlign: "left",
          fontWeight: "bold",
          marginLeft: isMobile ? "0" : "100px",
        }}
      >
        📍 Nearest Recovery Station
      </h2>

      {/* Container: sidebar + map */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
          gap: "1.5rem",
          maxWidth: "1400px",
          margin: isMobile ? "0 auto" : "0 auto 0 100px",
          alignItems: "stretch",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>🔍 Search Location</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter city or place"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#1e293b",
                color: "#fff",
                minWidth: "150px",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Go
            </button>
          </div>

          <h3 style={{ marginTop: "20px" }}>🏢 Quick Stations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.keys(stations).map((city) => (
              <button
                key={city}
                onClick={() => setPosition(stations[city])}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            minHeight: "400px",
          }}
        >
          <MapContainer
            center={position}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <Recenter position={position} />
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
