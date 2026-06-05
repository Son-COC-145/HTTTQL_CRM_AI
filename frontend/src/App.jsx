import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AIAnalysis from "./pages/AIAnalysis";
import AIRecommendation from "./pages/AIRecommendation";
import CustomerDetail from "./pages/CustomerDetail";
import Tasks from "./pages/Tasks";
import AIChat from "./pages/AIChat";

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  if (selectedCustomerId) {
    return (
      <Layout page={page} setPage={setPage}>
        <CustomerDetail
          customerId={selectedCustomerId}
          onBack={() => setSelectedCustomerId(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout page={page} setPage={setPage}>
      {page === "dashboard" && <Dashboard />}
      {page === "customers" && (
        <Customers onSelectCustomer={setSelectedCustomerId} />
      )}
      {page === "ai" && <AIAnalysis />}
      {page === "recommend" && <AIRecommendation />}
      {page === "tasks" && <Tasks />}
      {page === "chat" && <AIChat />}
    </Layout>
  );
}

export default App;