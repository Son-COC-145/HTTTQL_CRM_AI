function Header() {
  const email = localStorage.getItem("email");

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <header className="header">
      <div>
        <h2>CRM thông minh tích hợp AI</h2>
        <p>Quản lý khách hàng, phân tích tiềm năng và đề xuất chăm sóc</p>
      </div>

      <div className="user-box">
        <span>{email || "Admin"}</span>
        <button className="secondary-btn" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;