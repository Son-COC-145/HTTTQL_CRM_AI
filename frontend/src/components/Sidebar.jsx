function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">CRM AI</div>

      <button
        className={page === "dashboard" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("dashboard")}
      >
        Dashboard
      </button>

      <button
        className={page === "customers" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("customers")}
      >
        Customers
      </button>

      <button
        className={page === "ai" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("ai")}
      >
        AI Analysis
      </button>

      <button
        className={page === "recommend" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("recommend")}
      >
        AI Recommendation
      </button>

      <button
        className={page === "tasks" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("tasks")}
      >
        Tasks
      </button>

      <button
        className={page === "chat" ? "nav-item active" : "nav-item"}
        onClick={() => setPage("chat")}
      >
        AI Chat
      </button>
    </aside>
  );
}

export default Sidebar;