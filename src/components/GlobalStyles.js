// src/GlobalStyles.jsx
import React from "react";

export default function GlobalStyles() {
  const css = `
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: #050a14;
      overflow: auto;
      font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
      color: #0ff;
    }

    /* DIGITAL GRID */
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
      z-index: -3;
    }
    @keyframes gridMove {
      from { background-position: 0 0; }
      to   { background-position: 50px 50px; }
    }

    /* RADAR SWEEP */
    @keyframes sweep {
      0%   { transform: rotate(0deg); opacity: 0.5; }
      50%  { opacity: 0.2; }
      100% { transform: rotate(360deg); opacity: 0.5; }
    }
    .radar-sweep {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 400px;
      height: 400px;
      margin-left: -200px;
      margin-top: -200px;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        rgba(0,255,255,0.15),
        rgba(0,0,0,0) 60%
      );
      animation: sweep 6s linear infinite;
      z-index: -1;
      pointer-events: none;
      filter: blur(3px);
    }

    /* PULSING DETECTION ZONES */
    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 0.1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .pulse {
      position: fixed;
      width: 100px;
      height: 100px;
      border: 2px solid #0ff;
      border-radius: 50%;
      animation: pulse 3s ease-out infinite;
      z-index: -1;
      pointer-events: none;
      filter: blur(2px);
    }

    /* NETWORK NODES */
    .node {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0ff;
      z-index: -1;
      pointer-events: none;
      box-shadow: 0 0 10px #0ff;
      animation: nodePulse 4s infinite alternate;
    }
    @keyframes nodePulse {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.5); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }

    /* CONNECTION LINES */
    .connection {
      position: absolute;
      width: 2px;
      background: rgba(0,255,255,0.4);
      z-index: -2;
      pointer-events: none;
      transform-origin: top left;
    }
  `;

  // Generate random nodes
  const nodes = Array.from({ length: 15 }).map(() => ({
    top: Math.random() * 90 + "vh",
    left: Math.random() * 90 + "vw",
  }));

  // Generate random connections between nodes
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.2) { // 20% chance to connect nodes
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const x1 = parseFloat(nodeA.left);
        const y1 = parseFloat(nodeA.top);
        const x2 = parseFloat(nodeB.left);
        const y2 = parseFloat(nodeB.top);
        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        connections.push({ x1, y1, length, angle });
      }
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Radar Sweep */}
      <div className="radar-sweep"></div>

      {/* Pulsing detection zones */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="pulse"
          style={{
            top: `${Math.random() * 80 + 10}vh`,
            left: `${Math.random() * 80 + 10}vw`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        ></div>
      ))}

      {/* Network nodes */}
      
      {/* Connections between nodes */}
      {connections.map((c, i) => (
        <div
          key={i}
          className="connection"
          style={{
            top: `${c.y1}vh`,
            left: `${c.x1}vw`,
            width: `${c.length}vw`,
            transform: `rotate(${c.angle}deg)`,
          }}
        ></div>
      ))}
    </>
  );
}
