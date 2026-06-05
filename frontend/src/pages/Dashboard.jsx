import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const customerData = [
    { name: "HOT", value: stats.hotCustomers },
    { name: "WARM", value: stats.warmCustomers },
    { name: "COLD", value: stats.coldCustomers },
  ];

  const summaryData = [
    { name: "Customers", value: stats.totalCustomers },
    { name: "Orders", value: stats.totalOrders },
    { name: "Pending Tasks", value: stats.pendingTasks },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1>CRM AI Dashboard</h1>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Tổng khách hàng</h3>
          <p>{stats.totalCustomers}</p>
        </div>

        <div style={cardStyle}>
          <h3>Tổng đơn hàng</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div style={cardStyle}>
          <h3>Doanh thu</h3>
          <p>{stats.totalRevenue.toLocaleString()} VNĐ</p>
        </div>

        <div style={cardStyle}>
          <h3>Task chờ xử lý</h3>
          <p>{stats.pendingTasks}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "40px", marginTop: "40px", flexWrap: "wrap" }}>
        <div>
          <h2>Phân loại khách hàng AI</h2>

          <PieChart width={350} height={300}>
            <Pie
              data={customerData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#ef4444" />
              <Cell fill="#f59e0b" />
              <Cell fill="#3b82f6" />
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div>
          <h2>Tổng quan hệ thống</h2>

          <BarChart width={450} height={300} data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  minWidth: "180px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "12px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export default Dashboard;