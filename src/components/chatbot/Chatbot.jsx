import React, { useState, useRef, useEffect } from "react";
import { recAPI } from "../../services/api";
import { Heart, Star, Paperclip, X, Globe } from "../Icons";
import { useAuth } from "../../context/AuthContext";
import "./Chatbot.css";

const MOODS = [
  { label: "Cozy & Warm", key: "cozy" },
  { label: "Thrilling", key: "adventurous" },
  { label: "Romantic", key: "romantic" },
  { label: "Reflective", key: "relaxed" },
  { label: "Joyful", key: "happy" },
  { label: "Mysterious", key: "mystery" }
];

const LANGUAGES = [
  { id: "auto", label: "🌐 Auto" },
  { id: "hi", label: "🇮🇳 हिन्दी / Hinglish" },
  { id: "en", label: "🇬🇧 English" },
  { id: "es", label: "🇪🇸 Español" },
  { id: "fr", label: "🇫🇷 Français" }
];

function getClientSideFallback(query, lang = "auto") {
  const lower = (query || "").toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(query) || lang === "hi";
  const isHinglish = !isHindi && (
    lower.includes("mujhe") || lower.includes("batao") || lower.includes("kitab") ||
    lower.includes("karo") || lower.includes("hai") || lower.includes("kaisi") ||
    lower.includes("karein") || lower.includes("padhna") || lower.includes("chahiye") ||
    lower.includes("yaar") || lower.includes("bhai")
  );

  const categories = [
    {
      keys: ["horror", "bhoot", "darawani", "scary", "ghost", "creepy", "fear", "haunted"],
      hindi: "अगर आपको डर और रोंगटे खड़े कर देने वाली हॉरर किताबें पसंद हैं, तो ये क्लासिक्स जरूर पढ़ें:",
      hinglish: "Agar aapko spine-chilling aur darawani stories pasand hain, toh yeh classic horror masterworks padhein:",
      english: "If you love atmospheric chills, spine-tingling suspense, and gothic horror:",
      books: [
        { title: "Dracula", author: "Bram Stoker", reason: "Transylvania ke vampire count ki classic gothic horror kahani." },
        { title: "Frankenstein", author: "Mary Shelley", reason: "Ek scientist aur uske banaye monstrous jeev ki iconic tragedy." },
        { title: "The Haunting of Hill House", author: "Shirley Jackson", reason: "Ek purani haveli mein darr aur psychological horror." }
      ]
    },
    {
      keys: ["mystery", "thriller", "suspense", "detective", "crime", "jasoosi", "khoon", "investigation"],
      hindi: "रहस्य, सस्पेंस और जासूसी की दुनिया के बेहतरीन उपन्यास:",
      hinglish: "Suspense aur mind-bending mystery ke liye yeh thrillers sabse best rahenge:",
      english: "For edge-of-your-seat mystery, clever sleuthing, and thrilling twists:",
      books: [
        { title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", reason: "Sherlock Holmes aur Watson ka sabse mashhoor moorland case." },
        { title: "And Then There Were None", author: "Agatha Christie", reason: "Ek sunsan island par 10 ajnabi aur ek anjaan qatil ka suspense." },
        { title: "The Big Sleep", author: "Raymond Chandler", reason: "Classic noir detective Philip Marlowe ki gritty investigation." }
      ]
    },
    {
      keys: ["scifi", "sci-fi", "science", "space", "future", "alien", "galaxy", "technology", "time travel"],
      hindi: "भविष्य, ब्रह्मांड और विज्ञान कथा (Sci-Fi) की कालजयी कृतियां:",
      hinglish: "Cosmic adventure aur futuristic technology ke liye yeh epic sci-fi novels padhein:",
      english: "For mind-expanding sci-fi adventures, cosmic exploration, and distant worlds:",
      books: [
        { title: "Dune", author: "Frank Herbert", reason: "Arrakis ke registhan aur spice par kabze ki epic political sci-fi saga." },
        { title: "Project Hail Mary", author: "Andy Weir", reason: "Ek akela astronaut jo humanity ko bachane ke liye space mission par hai." },
        { title: "1984", author: "George Orwell", reason: "Totalitarian surveillance aur Big Brother par timeless dystopian thriller." }
      ]
    },
    {
      keys: ["romance", "love", "pyar", "ishq", "dil", "romantic", "couple", "relationship"],
      hindi: "हृदयस्पर्शी प्रेम, भावनाएं और मिठास से भरी प्रेम कहानियां:",
      hinglish: "Dil ko chhoo lene wali pyari aur emotional love stories:",
      english: "Delightful wit, passionate journeys, and unforgettable romantic connections:",
      books: [
        { title: "Pride and Prejudice", author: "Jane Austen", reason: "Elizabeth Bennet aur Mr. Darcy ka timeless banter aur prem." },
        { title: "Normal People", author: "Sally Rooney", reason: "Do dosto ke beech saalo tak chalne wala tender aur realistic prem." },
        { title: "Jane Eyre", author: "Charlotte Brontë", reason: "Swabhiman, himmat aur sachi mohabbat ki amar dastan." }
      ]
    },
    {
      keys: ["self-help", "habit", "success", "productivity", "mind", "motivation", "aadat", "kamyabi", "focus"],
      hindi: "व्यक्तिगत विकास, सफलता और नई आदतों का निर्माण करने वाली सर्वश्रेष्ठ पुस्तकें:",
      hinglish: "Apni productivity, mindset aur daily habits ko transform karne ke liye best books:",
      english: "High-impact guides to mastering your habits, focus, and personal growth:",
      books: [
        { title: "Atomic Habits", author: "James Clear", reason: "Chhote badlao se zindagi mein miraculous results pane ka roadmap." },
        { title: "The Psychology of Money", author: "Morgan Housel", reason: "Dhan, lalach aur financial freedom par timeless wisdom." },
        { title: "Ikigai", author: "Héctor García & Francesc Miralles", reason: "Lambi, khushhal aur maqsad-bhari zindagi jeene ka Japani rahasya." }
      ]
    },
    {
      keys: ["hindi", "desi", "premchand", "indian", "upanyas", "bharat", "sahitya"],
      hindi: "भारतीय साहित्य और मुंशी प्रेमचंद की अमर और प्रतिष्ठित रचनाएं:",
      hinglish: "Desi literature aur timeless Indian classics jo har reader ko padhni chahiye:",
      english: "Masterpieces of rich Indian literature and social storytelling:",
      books: [
        { title: "Godan", author: "Munshi Premchand", reason: "Bhartiya kisaan Hori ke sangharsh aur samaj ka aaina dikhane wala maha-upanyas." },
        { title: "Gunahon Ka Devta", author: "Dharamvir Bharati", reason: "Chandar aur Sudha ke nishpap prem ki sabse dardnak kahani." },
        { title: "Rashmirathi", author: "Ramdhari Singh Dinkar", reason: "Mahabharat ke veer Karna ke shaurya par likha gaya prerna-dayak kaavya." }
      ]
    },
    {
      keys: ["philosophy", "life", "zindagi", "meaning", "wisdom", "soul", "mindset", "darshan"],
      hindi: "जीवन का दर्शन, आत्म-मंथन और मन की शांति देने वाली महान पुस्तकें:",
      hinglish: "Zindagi ke gahre arth, shanti aur inner strength samajhne ke liye philosophical masterworks:",
      english: "Profound philosophical works exploring meaning, resilience, and wisdom:",
      books: [
        { title: "Meditations", author: "Marcus Aurelius", reason: "Stoic philosophy aur mushkil halat mein shaant rehne ki private diary." },
        { title: "Man's Search for Meaning", author: "Viktor E. Frankl", reason: "Zindagi ke sabse andhere mod par bhi jeene ki wajah dhoondne ka message." },
        { title: "Siddhartha", author: "Hermann Hesse", reason: "Aatma-gyan aur nadi ke kinaare shanti paane ki spiritual journey." }
      ]
    },
    {
      keys: ["comedy", "funny", "laugh", "haso", "humor", "light", "mazedar"],
      hindi: "हल्की-फुल्की, मजेदार और चेहरे पर मुस्कान ला देने वाली कॉमिक पुस्तकें:",
      hinglish: "Mood fresh karne aur dil khol kar hasne ke liye funny & witty books:",
      english: "Witty, laugh-out-loud satirical humor to brighten your day:",
      books: [
        { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", reason: "Space mein towel ke saath cosmic humor ki ultimate ride." },
        { title: "Three Men in a Boat", author: "Jerome K. Jerome", reason: "River Thames par 3 dosto aur ek dog ki comical holiday trip." },
        { title: "The Code of the Woosters", author: "P.G. Wodehouse", reason: "Bertie Wooster aur genius butler Jeeves ka unmatched comic banter." }
      ]
    },
    {
      keys: ["fantasy", "magic", "sword", "dragon", "wizard", "jaadu"],
      hindi: "जादुई दुनिया, रोमांचक गाथाएं और महाकाव्य फैंटेसी:",
      hinglish: "Magical worlds aur breath-taking adventures ke liye yeh fantasy books padhein:",
      english: "Immersive magical realms, legendary heroes, and mythical wonders:",
      books: [
        { title: "The Hobbit", author: "J.R.R. Tolkien", reason: "Bilbo Baggins ki cozy magar thrilling Middle-earth adventure." },
        { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Kvothe ke jaadu, sangharsh aur sangeet ki poetic fantasy kahani." },
        { title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", reason: "Jaadu aur apne andar ke andhere ko jeetne ki classic story." }
      ]
    }
  ];

  for (const cat of categories) {
    if (cat.keys.some(k => lower.includes(k))) {
      let text = cat.english;
      if (isHindi) text = cat.hindi;
      else if (isHinglish) text = cat.hinglish;
      return { text, books: cat.books };
    }
  }

  // Default varied response if no keyword matched
  if (isHindi) {
    return {
      text: "आपके लिए साहित्य की चुनिंदा और बहुचर्चित रचनाएं:",
      books: [
        { title: "The Alchemist", author: "Paulo Coelho", reason: "अपने सपनों और दिल की आवाज़ सुनने की अमर प्रेरणादायक कथा।" },
        { title: "Godan", author: "Munshi Premchand", reason: "भारतीय ग्रामीण जीवन और मानवता का महान दस्तावेज।" }
      ]
    };
  }

  if (isHinglish) {
    return {
      text: "Aapke liye BookWise AI ki taraf se handpicked diverse books:",
      books: [
        { title: "Atomic Habits", author: "James Clear", reason: "Daily habits aur mindset transform karne ka practical guide." },
        { title: "The Alchemist", author: "Paulo Coelho", reason: "Apne sapno ko follow karne ki ek dilchasp aur inspiring journey." }
      ]
    };
  }

  return {
    text: "Here are universally acclaimed recommendations across genres for you:",
    books: [
      { title: "To Kill a Mockingbird", author: "Harper Lee", reason: "A gripping and tender masterwork exploring morality and empathy." },
      { title: "Project Hail Mary", author: "Andy Weir", reason: "A delightfully smart and optimistic space survival journey." }
    ]
  };
}

function Chatbot({ onReadBook }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste & Hello! 📚 I am BookWise AI. Ask me anything in English, हिन्दी, or Hinglish! You can pick a mood, search recommendations, or attach a book excerpt/document (📎) to discuss."
    }
  ]);

  const [input, setInput] = useState("");
  const [activeMood, setActiveMood] = useState("");
  const [selectedLang, setSelectedLang] = useState("auto");
  const [attachedDoc, setAttachedDoc] = useState(null); // { name: string, text: string }
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toggleWishlist, isBookWishlisted } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setAttachedDoc({
        name: file.name,
        text: typeof text === "string" ? text : ""
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `📄 **Document loaded: "${file.name}"**\nI am now analyzing this text. Ask me to summarize it, explain key characters, or answer any question in Hindi, Hinglish, or English!`
        }
      ]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const sendMessage = async (preset = null) => {
    const textToSend = preset ? preset.label : input.trim();
    if (!textToSend || loading) return;

    if (preset) setActiveMood(preset.label);

    const userMsg = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (preset) {
        // Mood Preset clicked: fetch book recommendations for that mood
        let books = [];
        let replyIntro = "";

        if (preset.key === "mystery") {
          books = await recAPI.byGenre("mystery");
          replyIntro = "Here are edge-of-your-seat mysteries to keep your heart racing:";
        } else {
          books = await recAPI.byMood(preset.key);
          replyIntro = `Here are handpicked books matching your ${preset.label} mood:`;
        }

        const botMsg = {
          sender: "bot",
          text: replyIntro,
          books: Array.isArray(books) ? books.slice(0, 3) : []
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Free-form conversational message: call multilingual chat with document context
        const res = await recAPI.chat({
          message: textToSend,
          history: messages,
          language: selectedLang,
          bookContext: attachedDoc?.text || ""
        });

        const replyText = typeof res === "object" && res !== null ? res.reply : res;
        const newBooks = typeof res === "object" && res !== null && Array.isArray(res.books) ? res.books : [];

        const botMsg = {
          sender: "bot",
          text: replyText || "I'd love to help you find that book. Tell me more about what themes you enjoy!",
          books: newBooks
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.warn("Chatbot request failed:", err);
      const fallback = getClientSideFallback(textToSend, selectedLang);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: fallback.text,
          books: fallback.books
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleWishlistBook = async (book) => {
    if (toggleWishlist) {
      await toggleWishlist(book);
    }
  };

  return (
    <div className="chatbot-card">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-brand">
          <div className="logo-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>
          <div>
            <h3>BookWise <span>AI</span></h3>
            <p>MULTILINGUAL LITERARY COMPANION</p>
          </div>
        </div>
      </div>

      {/* Multilingual Language Selector Bar */}
      <div className="chatbot-lang-bar">
        <span className="lang-label">LANGUAGE:</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className={`lang-chip ${selectedLang === lang.id ? "active" : ""}`}
            onClick={() => setSelectedLang(lang.id)}
            title={`Set language to ${lang.label}`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="chatbot-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg-group ${m.sender}`}>
            <span className="msg-author">{m.sender === "user" ? "YOU" : "BOOKWISE AI"}</span>
            <div className="bubble">
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.55" }}>
                {m.text}
              </div>

              {/* Render Recommended Books Inside Chatbot */}
              {m.books && m.books.length > 0 && (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {m.books.map((b, bIdx) => {
                    const wishlisted = isBookWishlisted ? isBookWishlisted(b._id, b.title) : false;
                    return (
                      <div
                        key={bIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          background: "#fafaf8",
                          border: "1px solid #e2ded8",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: "8px" }}>
                          <strong style={{ display: "block", color: "#10192D", fontSize: "13px" }}>
                            {b.title}
                          </strong>
                          <span style={{ color: "#7A7265" }}>by {b.author}</span>
                          {b.reason && (
                            <p style={{ margin: "4px 0 0", color: "#555", fontStyle: "italic", fontSize: "11px" }}>
                              "{b.reason}"
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {onReadBook && (
                            <button
                              onClick={() => onReadBook(b)}
                              style={{
                                background: "#c9724d",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                              title="Read this book"
                            >
                              📖 Read
                            </button>
                          )}
                          <button
                            onClick={() => handleWishlistBook(b)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: wishlisted ? "#c9724d" : "#999",
                              padding: "4px"
                            }}
                            title={wishlisted ? "In Wishlist" : "Add to Wishlist"}
                          >
                            <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-group bot">
            <span className="msg-author">BOOKWISE AI</span>
            <div className="bubble" style={{ fontStyle: "italic", color: "#7A7265" }}>
              Reading and formulating response in {selectedLang === "auto" ? "your language" : selectedLang}...
            </div>
          </div>
        )}

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
              disabled={loading}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attached Document Banner */}
      {attachedDoc && (
        <div className="chat-attachment-bar">
          <span className="attachment-pill">
            📄 Analyzing: <strong>{attachedDoc.name}</strong>
          </span>
          <button
            className="attachment-remove"
            onClick={() => setAttachedDoc(null)}
            title="Remove document"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Area with File Upload 📎 */}
      <div className="chatbot-input-bar">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".txt,.md,.text"
          style={{ display: "none" }}
        />

        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload book / document (.txt, .md) to ask questions"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          placeholder={
            attachedDoc
              ? `Ask anything about ${attachedDoc.name}...`
              : selectedLang === "hi"
              ? "हिंदी या हिंग्लिश में कुछ भी पूछें..."
              : "Ask in Hindi, Hinglish, or English..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>
          {loading ? "..." : "SEND"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;