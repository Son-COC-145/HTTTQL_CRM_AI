import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function getScoreClass(score) {
  if (score >= 80) return "score-hot";
  if (score >= 60) return "score-warm";
  return "score-cold";
}

function AIRecommendation() {
  const [customers, setCustomers] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/customers")
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error("Không thể tải danh sách khách hàng!"));
  }, []);

  const getRecommendation = async (customer) => {
    try {
      setLoading(true);
      setSelectedCustomer(customer);

      const res = await api.post(`/ai/recommend-action/${customer.id}`);
      setRecommendation(res.data);

      toast.success("Đã tạo gợi ý chăm sóc!");
    } catch (error) {
      console.error(error);
      toast.error("Tạo gợi ý thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">AI Recommendation</h1>
      <p className="page-subtitle">
        Đề xuất hành động chăm sóc phù hợp cho từng khách hàng.
      </p>

      <div className="ai-card-grid">
        {customers.map((customer) => (
          <div className="ai-customer-card" key={customer.id}>
            <h3>{customer.fullName}</h3>

            <p>Trạng thái: {customer.status}</p>
            <p>Nguồn: {customer.source}</p>

            <span className={`score-badge ${getScoreClass(customer.potentialScore)}`}>
              {customer.potentialScore} điểm
            </span>

            <div style={{ marginTop: "16px" }}>
              <button
                className="primary-btn"
                onClick={() => getRecommendation(customer)}
                disabled={loading}
              >
                {loading && selectedCustomer?.id === customer.id
                  ? "Đang tạo..."
                  : "Gợi ý chăm sóc"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {recommendation && (
        <div className="card" style={{ marginTop: "24px" }}>
          <h2>Đề xuất cho {recommendation.customerName}</h2>

          <p>
            <strong>Mức ưu tiên:</strong>{" "}
            <span className="score-badge score-hot">
              {recommendation.priority}
            </span>
          </p>

          <div className="recommendation-list">
            {recommendation.recommendations.map((item, index) => (
              <div className="recommendation-item" key={index}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIRecommendation;