import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Records() {
  const [queryText, setQueryText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => Date.now().toString());

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!userId || !sessionId) return;

    const q = query(
      collection(db, "users", userId, "sessions", sessionId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [userId, sessionId]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setQueryText(spokenText);
      handleSend(spokenText);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => recognitionRef.current?.start();

  const speak = (text) => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking) synthRef.current.cancel();
  
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Police-officer-like voice configuration
    const voices = synthRef.current.getVoices();
    const policeVoice = voices.find((v) =>
      v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("en-us")
    );
    utterance.voice = policeVoice || voices[0];
    utterance.pitch = 0.7; // deeper tone
    utterance.rate = 0.85; // slower, authoritative
  
    synthRef.current.speak(utterance);
  };
  

  const stopSpeaking = () => synthRef.current.cancel();

  const handleSend = async (overrideQuery) => {
    const currentQuery = overrideQuery ?? queryText;
    if (!currentQuery.trim() || !userId) return;

    setQueryText("");
    setLoading(true);

    await addDoc(
      collection(db, "users", userId, "sessions", sessionId, "messages"),
      {
        type: "user",
        text: currentQuery,
        timestamp: serverTimestamp(),
      }
    );

    try {
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          Authorization: "Bearer TqLjM4pxlpEMpATTrVO46Bgrp0vxM0BD8fggfPEJ",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "command-r", message: currentQuery }),
      });
      const data = await response.json();
      const aiText = data.text || "No response";

      await addDoc(
        collection(db, "users", userId, "sessions", sessionId, "messages"),
        {
          type: "ai",
          text: aiText,
          timestamp: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(error);
      await addDoc(
        collection(db, "users", userId, "sessions", sessionId, "messages"),
        {
          type: "ai",
          text: "❌ Failed to get response.",
          timestamp: serverTimestamp(),
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(Date.now().toString());
  };

  const quickOptions = ["Report Theft", "Emergency Help", "File Complaint"];

  return (
    <div
      style={{
        minHeight: "100vh",
        
        color: "#00ff99",
        fontFamily: "'Courier New', monospace",
        padding: "2rem",
      }}
    >
      {/* Hacker-style AI Status Panel */}
      <div
        style={{
          
          
          borderRadius: "12px",
          padding: "16px 24px",
          maxWidth: "900px",
          margin: "0 auto 20px",
          animation: "glowBorder 2s infinite alternate",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          AI Assistant
        </div>
        <div>
          Status: <span style={{ color: "#3b82f6" }}>Online</span>
        </div>
        <div style={{ marginTop: "4px"}}>
          Hello Commander — System online. Recommend running signature_update.
        </div>
      </div>

      {/* Chat Container */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <button
          onClick={startNewChat}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            background: "#111",
            color: "#00ff99",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 5px #00ff99aa",
            alignSelf: "flex-start",
            
          }}
        >
           New Chat
        </button>

        <div
          ref={chatContainerRef}
          style={{
           
            
            borderRadius: "16px",
            padding: "20px",
            height: "80vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 0 10px #00ff99aa",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                background:
                  msg.type === "user"
                    ? "linear-gradient(90deg, #00ff99, #00ccff)"
                    : "linear-gradient(90deg, #0ff, #00ffaa)",
                color: "#000",
                padding: "12px 16px",
                borderRadius: "12px",
                maxWidth: "70%",
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
                boxShadow:
                  msg.type === "user"
                    ? "0 0 10px #00ff99"
                    : "0 0 10px #0ff",
                whiteSpace: "pre-wrap",
                animation: msg.type === "ai" ? "flickerText 1.5s infinite" : "",
              }}
            >
              {msg.text}
              {msg.type === "ai" && (
                <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => speak(msg.text)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#0ff",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Play
                  </button>
                  <button
                    onClick={stopSpeaking}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#f00",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ⏹ Stop
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ color: "#0ff", fontStyle: "italic" }}>
              AI Commander is typing <span className="blinking-dots">...</span>
            </div>
          )}
        </div>

        {/* Quick Options */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {quickOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSend(opt)}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                
                background: "#111",
                color: "#00ff99",
                cursor: "pointer",
                boxShadow: "0 0 4px #00ff99aa",
              }}
            >
              {opt}
            </button>
          ))}
          <button
            onClick={startListening}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              background: "#111",
              color: "#00ff99",
              cursor: "pointer",
              boxShadow: "0 0 4px #00ff99aa",
            }}
          >
            🎤 Voice
          </button>
        </div>

        {/* Input Box */}
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <input
            type="text"
            placeholder="Type your query..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid #00ff99",
              outline: "none",
              background: "#111",
              color: "#00ff99",
              fontFamily: "'Courier New', monospace",
              fontSize: "14px",
              boxShadow: "0 0 4px #00ff99aa",
              caretColor: "#0ff",
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid #00ff99",
              background: "#00ff99",
              color: "#000",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 0 6px #00ff99aa",
            }}
          >
            Send
          </button>
        </div>
      </section>

      <style>{`
        @keyframes glowBorder {
          0% { box-shadow: 0 0 8px #00ff99aa; }
          100% { box-shadow: 0 0 20px #00ff99; }
        }
        @keyframes flickerText {
          0%, 19%, 21%, 50%, 100% { opacity: 1; }
          20%, 20.5%, 50.5% { opacity: 0.6; }
        }
        .blinking-dots::after {
          content: '';
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}
