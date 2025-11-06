import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = ({ problemId, problemData }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // ✅ new state for toggle
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { from: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:8000/gemini/chat", {
        message: userInput,
        problemId: problemId || null,
      });

      const aiReply = res.data.reply;
      setMessages([...newMessages, { from: "bot", text: aiReply }]);
    } catch (err) {
      console.error("ChatBot error:", err.response?.data || err.message);
      setMessages([
        ...newMessages,
        { from: "bot", text: "⚠️ Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>CodeClash AI Helper</h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>−</button>
          </div>

          <div className="chatbox">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing">AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CodeClash AI..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;