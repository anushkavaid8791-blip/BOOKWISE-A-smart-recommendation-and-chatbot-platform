import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { X, Sparkles } from '../Icons';
import './FloatingChatbot.css';

export default function FloatingChatbot({ onReadBook }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  return (
    <div className="floating-chatbot-container">
      {/* Pop-up Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          <Chatbot onReadBook={onReadBook} />
        </div>
      )}

      {/* Tooltip hint on initial load */}
      {!isOpen && showTooltip && (
        <div className="floating-tooltip">
          Need a book match? Ask AI ✨
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        className={`floating-chatbot-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
        title={isOpen ? 'Close AI Chat' : 'BookWise AI Assistant'}
      >
        {!isOpen && <span className="floating-pulse" />}
        <span className="floating-icon">
          {isOpen ? <X size={24} /> : '🦉'}
        </span>
      </button>
    </div>
  );
}
