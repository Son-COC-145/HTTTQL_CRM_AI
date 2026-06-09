import { useState } from "react";
import api from "../api/api";

function Register({ onRegister, goLogin }) {
  const [form, setForm] = useState({
    fullName: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      onRegister();
    } catch (err) {
      setError("Đăng ký thất bại. Email có thể đã tồn tại.");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản quản trị CRM</p>

        {error && <div className="error-message">{error}</div>}

        <input
          name="fullName"
          placeholder="Họ tên"
          value={form.fullName}
          onChange={handleChange}
          required
        />

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
          Đăng ký
        </button>

        <button type="button" className="link-btn" onClick={goLogin}>
          Đã có tài khoản? Đăng nhập
        </button>
      </form>
    </div>
  );
}

export default Register;