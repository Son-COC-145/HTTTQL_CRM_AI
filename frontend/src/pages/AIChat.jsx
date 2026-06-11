import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";

function AIChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai/history");
      setHistory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const currentQuestion = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: currentQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const res = await api.post("/ai/chat", {
        question: currentQuestion,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.data.answer,
        },
      ]);

      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error("AI Chat đang quá tải hoặc vượt quota Gemini!");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Hiện tại AI đang tạm thời quá tải hoặc vượt giới hạn quota. Bạn hãy thử lại sau.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = (item) => {
    setMessages([
      {
        role: "user",
        text: item.question,
      },
      {
        role: "ai",
        text: item.answer,
      },
    ]);
  };

  return (
    <div>
      <h1 className="page-title">AI Chat Assistant</h1>
      <p className="page-subtitle">
        Hỏi AI về khách hàng, doanh thu, task hoặc đề xuất chăm sóc.
      </p>

      <div className="ai-chat-layout">
        <div className="history-panel">
          <h3>Lịch sử chat</h3>

          {history.length === 0 && (
            <p className="chat-placeholder">Chưa có lịch sử chat.</p>
          )}

          {history.map((item) => (
            <div
              className="history-item"
              key={item.id}
              onClick={() => openHistory(item)}
            >
              <strong>{item.question}</strong>

              <small>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""}
              </small>
            </div>
          ))}
        </div>

        <div className="chat-main">
          <div className="chat-container">
            <div className="chat-box">
              {messages.length === 0 && (
                <p className="chat-placeholder">
                  Gợi ý: “Khách hàng nào tiềm năng nhất?”, “Ai cần chăm sóc
                  trước?”, “Tóm tắt dữ liệu CRM hiện tại”.
                </p>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`chat-message-row ${msg.role}`}>
                  <div className={`chat-bubble ${msg.role}`}>
                    {msg.role === "user" ? "👤 " : "🤖 "}

                    {msg.role === "ai" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="chat-message-row ai">
                  <div className="chat-bubble ai">🤖 Đang suy nghĩ...</div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="chat-form">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi cho AI..."
              />

              <button className="primary-btn" type="submit" disabled={loading}>
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;