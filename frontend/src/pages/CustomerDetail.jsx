import { useEffect, useState } from "react";
import api from "../api/api";

function CustomerDetail({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [interactionForm, setInteractionForm] = useState({type: "CALL", content: "",}); 
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    dueDate: "",
  });

  const [orderForm, setOrderForm] = useState({
    orderCode: "",
    amount: "",
    status: "COMPLETED",
  });

  const [recommendation, setRecommendation] = useState(null);

  const fetchData = async () => {
    const customerRes = await api.get(`/customers/${customerId}`);
    const interactionRes = await api.get(`/interactions/customer/${customerId}`);
    const orderRes = await api.get(`/orders/customer/${customerId}`);
    const taskRes = await api.get(`/tasks/customer/${customerId}`);

    setCustomer(customerRes.data);
    setInteractions(interactionRes.data);
    setOrders(orderRes.data);
    setTasks(taskRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const analyzeAI = async () => {
    const res = await api.post(`/ai/analyze-customer/${customerId}`);
    setAiResult(res.data);
    fetchData();
  };

  const getRecommendation = async () => {
    const res = await api.post(`/ai/recommend-action/${customerId}`);
    setRecommendation(res.data);
  };

  const handleInteractionChange = (e) => {
    setInteractionForm({
        ...interactionForm,
        [e.target.name]: e.target.value,
    });
  };

  const createInteraction = async (e) => {
    e.preventDefault();

    await api.post(`/interactions/customer/${customerId}`, interactionForm);

    setInteractionForm({
        type: "CALL",
        content: "",
    });

    fetchData();
  };

  const handleTaskChange = (e) => {
    setTaskForm({
        ...taskForm,
        [e.target.name]: e.target.value,
    });
  };


  const createTask = async (e) => {
    e.preventDefault();

    await api.post(`/tasks/customer/${customerId}`, taskForm);

    setTaskForm({
        title: "",
        description: "",
        status: "TODO",
        dueDate: "",
    });

    fetchData();
  };

  const handleOrderChange = (e) => {
    setOrderForm({
        ...orderForm,
        [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (e) => {
    e.preventDefault();

    await api.post(`/orders/customer/${customerId}`, {
        ...orderForm,
        amount: Number(orderForm.amount),
    });

    setOrderForm({
        orderCode: "",
        amount: "",
        status: "COMPLETED",
    });

    fetchData();
  };

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="detail-layout">
      <button onClick={onBack}>← Quay lại</button>

      <h1>{customer.fullName}</h1>

      <div className="card">
        <h2>Thông tin khách hàng</h2>

        <div className="customer-info-grid">
            <div>
            <strong>Họ tên</strong>
            <p>{customer.fullName}</p>
            </div>

            <div>
            <strong>Số điện thoại</strong>
            <p>{customer.phone}</p>
            </div>

            <div>
            <strong>Email</strong>
            <p>{customer.email}</p>
            </div>

            <div>
            <strong>Nguồn</strong>
            <p>{customer.source}</p>
            </div>

            <div>
            <strong>Trạng thái</strong>
            <p>{customer.status}</p>
            </div>

            <div>
            <strong>Điểm AI</strong>
            <p>{customer.potentialScore}</p>
            </div>
        </div>
      </div>

      <button onClick={analyzeAI}>Phân tích AI</button>

      <div className="ai-action-group">
        <button className="primary-btn" onClick={analyzeAI}>
            Phân tích AI
        </button>

        <button className="secondary-btn" onClick={getRecommendation}>
            Gợi ý chăm sóc
        </button>
      </div>

      <button onClick={getRecommendation} style={{ marginLeft: "8px" }}>
        Gợi ý chăm sóc
      </button>

      {aiResult && (
        <div style={box}>
          <h2>Kết quả AI</h2>
          <p>Điểm: {aiResult.potentialScore}</p>
          <p>Level: {aiResult.level}</p>
          <p>Tóm tắt: {aiResult.summary}</p>
          <p>Đề xuất: {aiResult.suggestedAction}</p>
        </div>
      )}

      {recommendation && (
        <div style={box}>
            <h2>AI Recommendation</h2>

            <p>
            <strong>Khách hàng:</strong> {recommendation.customerName}
            </p>

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

        <div style={box}>
        <h2>Interactions</h2>

        <form onSubmit={createInteraction} style={{ marginBottom: "12px" }}>
            <select
            name="type"
            value={interactionForm.type}
            onChange={handleInteractionChange}
            >
            <option value="CALL">CALL</option>
            <option value="EMAIL">EMAIL</option>
            <option value="MESSAGE">MESSAGE</option>
            <option value="MEETING">MEETING</option>
            </select>

            <input
            name="content"
            placeholder="Nội dung tương tác"
            value={interactionForm.content}
            onChange={handleInteractionChange}
            required
            style={{ marginLeft: "8px" }}
            />

            <button type="submit" style={{ marginLeft: "8px" }}>
            Thêm tương tác
            </button>
        </form>

            <div className="section-list">
                {interactions.map((item) => (
                    <div className="section-item" key={item.id}>
                    <strong>{item.type}</strong>

                    <p>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>

        <div style={box}>
        <h2>Orders</h2>

        <form onSubmit={createOrder} style={{ marginBottom: "12px" }}>
            <input
            name="orderCode"
            placeholder="Mã đơn hàng"
            value={orderForm.orderCode}
            onChange={handleOrderChange}
            required
            />

            <input
            type="number"
            name="amount"
            placeholder="Số tiền"
            value={orderForm.amount}
            onChange={handleOrderChange}
            required
            style={{ marginLeft: "8px" }}
            />

            <select
            name="status"
            value={orderForm.status}
            onChange={handleOrderChange}
            style={{ marginLeft: "8px" }}
            >
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
            </select>

            <button type="submit" style={{ marginLeft: "8px" }}>
            Thêm đơn hàng
            </button>

            </form>

            <div className="section-list">
                {orders.map((order) => (
                    <div className="section-item" key={order.id}>
                    <strong>{order.orderCode}</strong>

                    <p>
                        {Number(order.amount).toLocaleString()} VNĐ
                    </p>

                    <p>{order.status}</p>
                    </div>
                ))}
            </div>
        </div>

      <div style={box}>
        <h2>Tasks</h2>

        <form onSubmit={createTask} style={{ marginBottom: "12px" }}>
            <input
            name="title"
            placeholder="Tiêu đề task"
            value={taskForm.title}
            onChange={handleTaskChange}
            required
            />

            <input
            name="description"
            placeholder="Mô tả"
            value={taskForm.description}
            onChange={handleTaskChange}
            style={{ marginLeft: "8px" }}
            />

            <select
            name="status"
            value={taskForm.status}
            onChange={handleTaskChange}
            style={{ marginLeft: "8px" }}
            >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
            </select>

            <input
            type="datetime-local"
            name="dueDate"
            value={taskForm.dueDate}
            onChange={handleTaskChange}
            style={{ marginLeft: "8px" }}
            />

            <button type="submit" style={{ marginLeft: "8px" }}>
            Thêm task
            </button>
        </form>

            <div className="section-list">
                {tasks.map((task) => (
                    <div className="section-item" key={task.id}>
                    <strong>{task.title}</strong>

                    <p>{task.description}</p>

                    <p>{task.status}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

const box = {
  marginTop: "20px",
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "10px",
};

export default CustomerDetail;