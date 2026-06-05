import { useState } from "react";
import api from "../api/api";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    const res = await api.post("/ai/chat", {
      question,
    });

    const aiMessage = {
      role: "ai",
      text: res.data.answer,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setQuestion("");
  };

  return (
    <div>
      <h1>AI Chat Assistant</h1>

      <div className="card chat-box">
        {messages.length === 0 && (
          <p className="chat-placeholder">
            Hỏi AI về khách hàng, task, doanh thu hoặc chăm sóc khách hàng.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === "user" ? "chat-message user" : "chat-message ai"}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ví dụ: Khách hàng nào tiềm năng nhất?"
        />

        <button className="primary-btn" type="submit">
          Gửi
        </button>
      </form>
    </div>
  );
}

export default AIChat;