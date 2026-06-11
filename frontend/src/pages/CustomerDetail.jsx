import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function CustomerDetail({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [interactionForm, setInteractionForm] = useState({
    type: "CALL",
    content: "",
  });

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

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const fetchData = async () => {
    try {
      const [customerRes, interactionRes, orderRes, taskRes] =
        await Promise.all([
          api.get(`/customers/${customerId}`),
          api.get(`/interactions/customer/${customerId}`),
          api.get(`/orders/customer/${customerId}`),
          api.get(`/tasks/customer/${customerId}`),
        ]);

      setCustomer(customerRes.data);
      setInteractions(interactionRes.data);
      setOrders(orderRes.data);
      setTasks(taskRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết khách hàng!");
    }
  };

  const analyzeAI = async () => {
    try {
      setLoadingAI(true);
      toast.info("Đang phân tích AI...");

      const res = await api.post(`/ai/analyze-customer/${customerId}`);

      setAiResult(res.data);
      toast.success("Phân tích AI hoàn tất!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Phân tích AI thất bại!");
    } finally {
      setLoadingAI(false);
    }
  };

  const getRecommendation = async () => {
    try {
      setLoadingAI(true);
      const res = await api.post(`/ai/recommend-action/${customerId}`);

      setRecommendation(res.data);
      toast.success("Đã tạo gợi ý chăm sóc!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo gợi ý chăm sóc!");
    } finally {
      setLoadingAI(false);
    }
  };

  const createInteraction = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/interactions/customer/${customerId}`, interactionForm);

      setInteractionForm({
        type: "CALL",
        content: "",
      });

      toast.success("Thêm tương tác thành công!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Thêm tương tác thất bại!");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/tasks/customer/${customerId}`, taskForm);

      setTaskForm({
        title: "",
        description: "",
        status: "TODO",
        dueDate: "",
      });

      toast.success("Thêm task thành công!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Thêm task thất bại!");
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/orders/customer/${customerId}`, {
        ...orderForm,
        amount: Number(orderForm.amount),
      });

      setOrderForm({
        orderCode: "",
        amount: "",
        status: "COMPLETED",
      });

      toast.success("Thêm đơn hàng thành công!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Thêm đơn hàng thất bại!");
    }
  };

  const createTaskFromAI = async () => {
    if (!aiResult?.suggestedAction) {
      toast.error("Chưa có đề xuất AI để tạo task!");
      return;
    }

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await api.post(`/tasks/customer/${customerId}`, {
        title: `AI đề xuất chăm sóc ${customer.fullName}`,
        description: aiResult.suggestedAction,
        status: "TODO",
        dueDate: tomorrow.toISOString().slice(0, 16),
      });

      toast.success("Đã tạo task chăm sóc từ AI!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo task từ AI!");
    }
  };

  if (!customer) return <p>Loading...</p>;

  return (
    <div className="detail-layout">
      <button className="secondary-btn" onClick={onBack}>
        ← Quay lại
      </button>

      <div className="card">
        <h1>{customer.fullName}</h1>

        <div className="customer-info-grid">
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

          <div>
            <strong>Ghi chú</strong>
            <p>{customer.note}</p>
          </div>
        </div>
      </div>

      <div className="ai-action-group">
        <button className="primary-btn" onClick={analyzeAI} disabled={loadingAI}>
          {loadingAI ? "Đang xử lý..." : "Phân tích AI"}
        </button>

        <button className="secondary-btn" onClick={getRecommendation} disabled={loadingAI}>
          Gợi ý chăm sóc
        </button>
      </div>

      {aiResult && (
        <div className="card">
          <h2>Kết quả AI</h2>
          <p><strong>Điểm:</strong> {aiResult.potentialScore}</p>
          {aiResult.reasons && (
            <div>
              <h3>Vì sao AI chấm điểm này?</h3>

              <ul>
                {aiResult.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          <p><strong>Level:</strong> {aiResult.level}</p>
          <p><strong>Tóm tắt:</strong> {aiResult.summary}</p>
          <p><strong>Đề xuất:</strong> {aiResult.suggestedAction}</p>
          <button className="primary-btn" onClick={createTaskFromAI}>
            Tạo task từ đề xuất AI
          </button>
        </div>
      )}

      {recommendation && (
        <div className="card">
          <h2>AI Recommendation</h2>
          <p><strong>Khách hàng:</strong> {recommendation.customerName}</p>
          <p><strong>Mức ưu tiên:</strong> {recommendation.priority}</p>

          <h3>Hành động nên thực hiện</h3>
          <ul>
            {recommendation.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2>Interactions</h2>

        <form onSubmit={createInteraction} className="inline-form">
          <select
            name="type"
            value={interactionForm.type}
            onChange={(e) =>
              setInteractionForm({
                ...interactionForm,
                type: e.target.value,
              })
            }
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
            onChange={(e) =>
              setInteractionForm({
                ...interactionForm,
                content: e.target.value,
              })
            }
            required
          />

          <button className="primary-btn" type="submit">
            Thêm tương tác
          </button>
        </form>

        <div className="section-list">
          {interactions.map((item) => (
            <div className="section-item" key={item.id}>
              <strong>{item.type}</strong>
              <p>{item.content}</p>
              <small>{item.interactionDate}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Orders</h2>

        <form onSubmit={createOrder} className="inline-form">
          <input
            name="orderCode"
            placeholder="Mã đơn hàng"
            value={orderForm.orderCode}
            onChange={(e) =>
              setOrderForm({
                ...orderForm,
                orderCode: e.target.value,
              })
            }
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Số tiền"
            value={orderForm.amount}
            onChange={(e) =>
              setOrderForm({
                ...orderForm,
                amount: e.target.value,
              })
            }
            required
          />

          <select
            name="status"
            value={orderForm.status}
            onChange={(e) =>
              setOrderForm({
                ...orderForm,
                status: e.target.value,
              })
            }
          >
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button className="primary-btn" type="submit">
            Thêm đơn hàng
          </button>
        </form>

        <div className="section-list">
          {orders.map((order) => (
            <div className="section-item" key={order.id}>
              <strong>{order.orderCode}</strong>
              <p>{Number(order.amount).toLocaleString()} VNĐ</p>
              <p>{order.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Tasks</h2>

        <form onSubmit={createTask} className="inline-form">
          <input
            name="title"
            placeholder="Tiêu đề task"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                title: e.target.value,
              })
            }
            required
          />

          <input
            name="description"
            placeholder="Mô tả"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                description: e.target.value,
              })
            }
          />

          <select
            name="status"
            value={taskForm.status}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                status: e.target.value,
              })
            }
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <input
            type="datetime-local"
            name="dueDate"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                dueDate: e.target.value,
              })
            }
          />

          <button className="primary-btn" type="submit">
            Thêm task
          </button>
        </form>

        <div className="section-list">
          {tasks.map((task) => (
            <div className="section-item" key={task.id}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <span className={`badge ${task.status?.toLowerCase()}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;