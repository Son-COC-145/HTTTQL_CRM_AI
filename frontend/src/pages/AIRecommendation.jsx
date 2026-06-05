import { useEffect, useState } from "react";
import api from "../api/api";

function AIRecommendation() {
  const [customers, setCustomers] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/customers")
      .then((res) => setCustomers(res.data))
      .catch(console.error);
  }, []);

  const getRecommendation = async (customerId) => {
    try {
      setLoading(true);

      const res = await api.post(`/ai/recommend-action/${customerId}`);
      setRecommendation(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>AI Recommendation</h1>

      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Điểm AI</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.fullName}</td>
              <td>{customer.potentialScore}</td>
              <td>{customer.status}</td>
              <td>
                <button onClick={() => getRecommendation(customer.id)}>
                  Gợi ý chăm sóc
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Đang tạo gợi ý...</p>}

      {recommendation && (
        <div style={resultBox}>
          <h2>Đề xuất cho {recommendation.customerName}</h2>

          <p>
            <strong>Mức ưu tiên:</strong> {recommendation.priority}
          </p>

          <h3>Hành động nên thực hiện:</h3>

          <ul>
            {recommendation.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const resultBox = {
  marginTop: "24px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  background: "#fff",
};

export default AIRecommendation;