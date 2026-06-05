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
  LineChart,
  Line,
} from "recharts";
import api from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error);

    api.get("/customers/top-potential")
      .then((res) => setTopCustomers(res.data))
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

  const sourceData = stats.customerSources || [];
  const statusData = stats.customerStatuses || [];
  const revenueData = stats.monthlyRevenue || [];

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

      <div className="chart-grid">
        <div className="card">
          <h2>Nguồn khách hàng</h2>

          <PieChart width={350} height={280}>
            <Pie
              data={sourceData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {sourceData.map((_, index) => (
                <Cell
                  key={index}
                  fill={["#2563eb", "#10b981", "#f59e0b", "#ef4444"][index % 4]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="card">
          <h2>Trạng thái khách hàng</h2>

          <BarChart width={450} height={280} data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </div>
      </div>

      <div className="card" style={{ marginTop: "28px" }}>
        <h2>Doanh thu theo tháng</h2>

        <LineChart width={900} height={300} data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
        </LineChart>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <h2>Phễu chuyển đổi khách hàng</h2>

        <div className="funnel">
          <div className="funnel-item lead">
            LEAD: {stats.customerStatuses
              ?.find(x => x.name === "LEAD")?.value || 0}
          </div>

          <div className="funnel-item potential">
            POTENTIAL: {stats.customerStatuses
              ?.find(x => x.name === "POTENTIAL")?.value || 0}
          </div>

          <div className="funnel-item customer">
            CUSTOMER: {stats.customerStatuses
              ?.find(x => x.name === "CUSTOMER")?.value || 0}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <h2>Top khách hàng tiềm năng</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Điểm AI</th>
            </tr>
          </thead>

          <tbody>
            {topCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.fullName}</td>
                <td>{customer.potentialScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;