import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const MOODS = [
  { label: "Cozy & Warm", key: "cozy" },
  { label: "Thrilling", key: "angry" },
  { label: "Romantic", key: "romantic" },
  { label: "Mind-Bending", key: "adventurous" },
  { label: "Reflective", key: "stressed" },
  { label: "Light & Joyful", key: "happy" }
];

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm BookWise. Pick a mood below or describe what you're in the mood to read today."
    }
  ]);

  const [input, setInput] = useState("");
  const [activeMood, setActiveMood] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectMood = (message) => {
    const text = message.toLowerCase();
    if (text.includes("sad") || text.includes("lonely") || text.includes("cozy") || text.includes("warm")) return "cozy";
    if (text.includes("happy") || text.includes("excited") || text.includes("joyful") || text.includes("light")) return "happy";
    if (text.includes("stressed") || text.includes("anxious") || text.includes("reflective")) return "stressed";
    if (text.includes("romantic") || text.includes("love")) return "romantic";
    if (text.includes("adventure") || text.includes("thrilling") || text.includes("mind-bending")) return "adventurous";
    if (text.includes("angry") || text.includes("frustrated")) return "angry";
    return "unknown";
  };

  const getRecommendation = (moodKey) => {
    switch (moodKey) {
      case "cozy":
        return "Since you're looking for something cozy & warm, a gentle narrative with rich world-building might fit perfectly. 📖";
      case "happy":
        return "Great mood! A high-energy, feel-good read will keep that momentum going. 🎉";
      case "stressed":
      case "reflective":
        return "A calming, insightful book will help you step back and unwind tonight. 🌿";
      case "romantic":
        return "Looking for connection? Here is an atmospheric romance full of rich character depth. ❤️";
      case "adventurous":
        return "Ready to dive in? An immersive mystery or thrilling speculative fiction awaits. 🧭";
      case "angry":
        return "Need an edge-of-your-seat distraction? A gripping thriller will grab your focus. 🔥";
      default:
        return "Tell me a little more about what kind of setting or theme you'd like, and I'll find the right match. ✨";
    }
  };

  const sendMessage = (preset = null) => {
    const textToSend = preset ? preset.label : input.trim();
    if (!textToSend) return;

    if (preset) setActiveMood(preset.label);

    const userMsg = { sender: "user", text: textToSend };
    const moodKey = preset ? preset.key : detectMood(textToSend);
    const botMsg = { sender: "bot", text: getRecommendation(moodKey) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbot-card">
      {/* Header aligned with UI top navbar styling */}
      <div className="chatbot-header">
        <div className="header-brand">
          <div className="logo-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>
          <div>
            <h3>BookWise <span>AI</span></h3>
            <p>MOOD-FIRST BOOK DISCOVERY</p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="chatbot-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg-group ${m.sender}`}>
            <span className="msg-author">{m.sender === "user" ? "YOU" : "BOOKWISE"}</span>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mood Selector Pills */}
      <div className="mood-container">
        <span className="mood-label">WHAT'S THE MOOD TODAY?</span>
        <div className="mood-chips">
          {MOODS.map((m) => (
            <button
              key={m.label}
              className={`mood-pill ${activeMood === m.label ? "active" : ""}`}
              onClick={() => sendMessage(m)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="chatbot-input-bar">
        <input
          type="text"
          placeholder="Describe your mood or what you want to read..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={() => sendMessage()}>
          SEND
        </button>
      </div>
    </div>
  );
}

export default Chatbot;