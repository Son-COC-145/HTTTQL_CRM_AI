import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AIAnalysis from "./pages/AIAnalysis";
import AIRecommendation from "./pages/AIRecommendation";
import CustomerDetail from "./pages/CustomerDetail";
import Tasks from "./pages/Tasks";
import AIChat from "./pages/AIChat";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [authPage, setAuthPage] = useState("login");

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

  if (!isAuth) {
    return authPage === "login" ? (
      <Login
        onLogin={() => setIsAuth(true)}
        goRegister={() => setAuthPage("register")}
      />
    ) : (
      <Register
        onRegister={() => setIsAuth(true)}
        goLogin={() => setAuthPage("login")}
      />
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