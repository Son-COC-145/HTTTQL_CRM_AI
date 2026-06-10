import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function getScoreClass(score) {
  if (score >= 80) return "score-hot";
  if (score >= 60) return "score-warm";
  return "score-cold";
}

function AIAnalysis() {
  const [customers, setCustomers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/customers")
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error("Không thể tải danh sách khách hàng!"));
  }, []);

  const analyzeCustomer = async (customer) => {
    try {
      setLoading(true);
      setSelectedCustomer(customer);

      const res = await api.post(`/ai/analyze-customer/${customer.id}`);
      setResult(res.data);

      toast.success("Phân tích AI hoàn tất!");
    } catch (error) {
      console.error(error);
      toast.error("Phân tích AI thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">AI Customer Analysis</h1>
      <p className="page-subtitle">
        Phân tích tiềm năng khách hàng dựa trên dữ liệu CRM và Gemini AI.
      </p>

      <div className="ai-card-grid">
        {customers.map((customer) => (
          <div className="ai-customer-card" key={customer.id}>
            <h3>{customer.fullName}</h3>

            <p>Nguồn: {customer.source}</p>
            <p>Trạng thái: {customer.status}</p>

            <span className={`score-badge ${getScoreClass(customer.potentialScore)}`}>
              {customer.potentialScore} điểm
            </span>

            <div style={{ marginTop: "16px" }}>
              <button
                className="primary-btn"
                onClick={() => analyzeCustomer(customer)}
                disabled={loading}
              >
                {loading && selectedCustomer?.id === customer.id
                  ? "Đang phân tích..."
                  : "Phân tích AI"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="ai-result-card">
          <h2>Kết quả phân tích</h2>

          <p>
            Khách hàng: <strong>{selectedCustomer?.fullName}</strong>
          </p>

          <div className="ai-result-score">{result.potentialScore}</div>

          <h2>{result.level}</h2>

          <p>{result.summary}</p>

          <h3>Đề xuất chăm sóc</h3>
          <p>{result.suggestedAction}</p>
        </div>
      )}
    </div>
  );
}

export default AIAnalysis;