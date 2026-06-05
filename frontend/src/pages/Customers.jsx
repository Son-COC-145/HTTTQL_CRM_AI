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
      .catch(console.error);
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
    { name: "Tasks", value: stats.pendingTasks },
  ];

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <span>Tổng khách hàng</span>
          <strong>{stats.totalCustomers}</strong>
        </div>

        <div className="card stat-card">
          <span>Tổng đơn hàng</span>
          <strong>{stats.totalOrders}</strong>
        </div>

        <div className="card stat-card">
          <span>Doanh thu</span>
          <strong>{stats.totalRevenue.toLocaleString()} VNĐ</strong>
        </div>

        <div className="card stat-card">
          <span>Task chờ xử lý</span>
          <strong>{stats.pendingTasks}</strong>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2>Phân loại khách hàng AI</h2>

          <PieChart width={350} height={280}>
            <Pie
              data={customerData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              <Cell fill="#ef4444" />
              <Cell fill="#f59e0b" />
              <Cell fill="#3b82f6" />
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="card">
          <h2>Tổng quan hệ thống</h2>

          <BarChart width={450} height={280} data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;