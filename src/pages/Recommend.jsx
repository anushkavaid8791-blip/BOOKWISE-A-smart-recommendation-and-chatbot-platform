import React from "react";
import Chatbot from "../components/chatbot/Chatbot";
import "./Recommend.css";

function Recommend() {
  return (
    <div className="recommend-page">
      <div className="recommend-wrapper">
        
        {/* Left Side: Content & Info Header */}
        <div className="recommend-hero">
          <p className="eyebrow">MOOD-FIRST DISCOVERY</p>
          <h1>
            Find your next read, for however you're <em>feeling.</em>
          </h1>
          <p className="tagline">
            BookWise reads the room, not just the genre list. Pick a mood or talk to our concierge to narrow millions of titles down to the ones that fit tonight.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <div>
                <strong>Tailored AI Picks</strong>
                <p>Recommendations mapped directly to your current emotional vibe.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <div>
                <strong>Instant Suggestions</strong>
                <p>No endless browsing—get curated suggestions in seconds.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        <div className="recommend-chat-container">
          <Chatbot />
        </div>

      </div>
    </div>
  );
}

export default Recommend;