// src/components/HeroMega.js
import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import earthAnimation from "./Green Robot.json"; // <-- Add your Lottie JSON here

export default function HeroMega({ slogans = null }) {
  const canvasRef = useRef(null);
  const assistantTimeoutRef = useRef(null);
  const [typed, setTyped] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [forward, setForward] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [consoleCmd, setConsoleCmd] = useState("");
  const [consoleLog, setConsoleLog] = useState([]);

  const SLOGANS = slogans || [
    "Investigate — uncover the truth.",
    "Protect — shield citizens & data.",
    "Recover — restore what’s lost.",
    "Empower — community defence.",
    "Alert — live threat monitoring.",
  ];

  // Typewriter effect
  useEffect(() => {
    const typeSpeed = 50;
    const pause = 1400;

    const ticker = setInterval(() => {
      let currentSlogan = SLOGANS[sloganIndex];
      if (forward) {
        setTyped(currentSlogan.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex + 1 >= currentSlogan.length) {
          setForward(false);
          clearInterval(ticker);
          setTimeout(() => setForward(false), pause);
        }
      } else {
        setTyped(currentSlogan.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        if (charIndex - 1 <= 0) {
          setForward(true);
          setSloganIndex((s) => (s + 1) % SLOGANS.length);
          clearInterval(ticker);
        }
      }
    }, typeSpeed);

    return () => clearInterval(ticker);
  }, [charIndex, forward, sloganIndex]);

  // AI assistant bubble
  useEffect(() => {
    assistantTimeoutRef.current = setTimeout(() => setShowAssistant(true), 900);
    return () => clearTimeout(assistantTimeoutRef.current);
  }, []);

  // Terminal simulation
  useEffect(() => {
    const baseLines = [
      "Initializing Virtual Defence System...",
      "Firewall status: OPERATIONAL",
      "Ingesting live reports...",
      "Threat signature db: synced",
      "Monitoring sensors...",
    ];
    setConsoleLog([...baseLines]);

    const interval = setInterval(() => {
      const verbs = ["Scan", "Verify", "Block", "Flag", "Trace"];
      const things = ["IP", "device", "incident", "signature", "user"];
      const r = `${verbs[Math.floor(Math.random() * verbs.length)]} ${things[Math.floor(Math.random() * things.length)]} - ${Math.random().toString(36).slice(2, 8)}`;
      setConsoleLog(prev => [r, ...prev].slice(0, 60));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const handleConsoleRun = () => {
    if (!consoleCmd.trim()) return;
    const t = `[CMD] ${consoleCmd} — ${new Date().toLocaleTimeString()}`;
    setConsoleLog(prev => [t, ...prev].slice(0, 80));
    setConsoleCmd("");
    setTimeout(() => {
      const response = `[SYS] Executed "${consoleCmd}" — ${Math.random() > 0.6 ? "Success" : "Check logs"}`;
      setConsoleLog(prev => [response, ...prev].slice(0, 80));
    }, 900);
  };

  const handleDeploy = () => {
    setConsoleLog(prev => [`[CMD] deploy_defence ${new Date().toLocaleTimeString()}`, "[SYS] Launching countermeasures...", "[SYS] Running signature updates...", ...prev]);
  };

  const styles = {
    root:{ position:"relative", overflow:"hidden", color:"#fff", padding:"3rem 1rem", fontFamily:"'Inter', sans-serif" },
    content:{ position:"relative", zIndex:5, display:"grid", gridTemplateColumns:"1fr 420px", gap:24, alignItems:"center", minHeight:400 },
    left:{ padding:"0.6rem" },
    title:{ fontSize:36, fontWeight:700,  marginBottom:12 },
    subtitle:{ fontSize:16, color:"#bcd6e6", marginBottom:14 },
    typewriter:{ display:"flex", gap:6, alignItems:"center", color:"#62ffa5", fontFamily:"'Courier New', monospace", fontSize:16 },
    lottieWrap:{ width:320, height:320, margin:"0 auto", borderRadius:16, boxShadow:"0 0 40px rgba(0,255,150,0.2)", border:"1px solid rgba(255,255,255,0.03)" },
    ctaGroup:{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" },
    ctaBtn:{ background:"linear-gradient(180deg,#00ff99,#00cc77)", border:"none", color:"#002018", fontWeight:700, padding:"10px 14px", borderRadius:10, cursor:"pointer", boxShadow:"0 0 20px rgba(0,204,119,0.25)", transition:"0.3s", fontSize:15 },
    altBtn:{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#bcd6e6", padding:"10px 12px", borderRadius:8, cursor:"pointer", transition:"0.3s", fontSize:14 },
    terminal:{ background:"rgba(2,6,23,0.8)", color:"#4aff9c", padding:12, borderRadius:10, height:150, overflow:"auto", fontFamily:"'Courier New', monospace", fontSize:12, border:"1px solid rgba(0,255,150,0.06)" },
    consoleInput:{ display:"flex", gap:8, marginTop:10 },
    inputBox:{ flex:1, background:"rgba(255,255,255,0.02)", color:"#dfffe8", border:"1px solid rgba(255,255,255,0.03)", padding:"8px 10px", borderRadius:8, fontFamily:"'Courier New', monospace" },
    assistant:{ position:"absolute", top:12, right:12, zIndex:6, background:"rgba(6,8,14,0.95)", padding:"10px 12px", borderRadius:12, boxShadow:"0 10px 40px rgba(3,7,18,0.6)", border:"1px solid rgba(0,255,150,0.06)", color:"#aeeac1", fontSize:13 },
    assistantDot:{ width:10,height:10,borderRadius:10,background:"linear-gradient(180deg,#00ff80,#00a86b)", boxShadow:"0 0 8px rgba(0,255,150,0.35)" }
  };

  return (
    <section style={styles.root}>
      {showAssistant && (
        <div style={styles.assistant} role="status" aria-live="polite">
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <div style={styles.assistantDot} />
            <div><strong>AI Assistant</strong><div style={{fontSize:11,color:"#8fd9b3"}}>Status: Online</div></div>
          </div>
          <div>Hello Commander — System online. Recommend running <em>signature_update</em>.</div>
        </div>
      )}
      <div style={styles.content}>
        <div style={styles.left}>
          <h1 style={styles.title}>Virtual Defence System</h1>
          <div style={styles.subtitle}>Investigate, Protect, Recover — the Virtual Defence way.</div>
          <div style={styles.typewriter}><span>»</span> {typed}</div>
          <div style={{marginTop:16}}>
            <div style={styles.lottieWrap}>
              <Lottie animationData={earthAnimation} loop style={{width:"100%",height:"100%"}} />
            </div>
          </div>
          <div style={styles.ctaGroup}>
            <button style={styles.ctaBtn} onClick={handleDeploy}>Deploy Defence</button>
            <button style={styles.altBtn} onClick={()=>window.location.href="/dashboard"}>Open Dashboard</button>
          </div>
        </div>
        <div>
          <div style={styles.terminal} aria-live="polite">{consoleLog.map((l,i)=><div key={i}>{l}</div>)}</div>
          <div style={styles.consoleInput}>
            <input style={styles.inputBox} placeholder='Type command e.g. "signature_update"' value={consoleCmd} onChange={e=>setConsoleCmd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") handleConsoleRun();}}/>
            <button style={styles.ctaBtn} onClick={handleConsoleRun}>Run</button>
            <button style={styles.altBtn} onClick={()=>setConsoleLog([])}>Clear</button>
          </div>
        </div>
      </div>
    </section>
  );
}
