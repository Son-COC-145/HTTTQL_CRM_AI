import { useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function Login({ onLogin, goRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      toast.success("Đăng nhập thành công!");

      onLogin();
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng");
      toast.error("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>Đăng nhập</h1>
        <p>CRM thông minh tích hợp AI</p>

        {error && <div className="error-message">{error}</div>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="primary-btn" type="submit">
          Đăng nhập
        </button>

        <button type="button" className="link-btn" onClick={goRegister}>
          Chưa có tài khoản? Đăng ký
        </button>
      </form>
    </div>
  );
}

export default Login;