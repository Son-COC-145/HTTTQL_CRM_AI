import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function Customers({ onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    fullName: "",
    phone: "",
    email: "",
    source: "",
    status: "LEAD",
    note: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const createCustomer = async (e) => {
    e.preventDefault();

    try {
      await api.post("/customers", form);
      toast.success("Thêm khách hàng thành công!");
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Thêm khách hàng thất bại!");
    }
  };

  const editCustomer = (customer) => {
    setEditingId(customer.id);

    setForm({
      fullName: customer.fullName || "",
      phone: customer.phone || "",
      email: customer.email || "",
      source: customer.source || "",
      status: customer.status || "LEAD",
      note: customer.note || "",
    });
  };

  const updateCustomer = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/customers/${editingId}`, form);
      toast.success("Cập nhật khách hàng thành công!");
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật khách hàng thất bại!");
    }
  };

  const deleteCustomer = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa khách hàng này?");

    if (!confirmed) return;

    try {
      await api.delete(`/customers/${id}`);
      toast.success("Xóa khách hàng thành công!");
      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Xóa khách hàng thất bại!");
    }
  };

  return (
    <div>
      <h1>Quản lý khách hàng</h1>

      <div className="card" style={{ marginBottom: "24px" }}>
        <h2>{editingId ? "Cập nhật khách hàng" : "Thêm khách hàng"}</h2>

        <form
          onSubmit={editingId ? updateCustomer : createCustomer}
          className="customer-form"
        >
          <input
            name="fullName"
            placeholder="Họ tên"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="source"
            placeholder="Nguồn khách hàng"
            value={form.source}
            onChange={handleChange}
          />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="LEAD">LEAD</option>
            <option value="POTENTIAL">POTENTIAL</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <textarea
            name="note"
            placeholder="Ghi chú"
            value={form.note}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary-btn" type="submit">
              {editingId ? "Cập nhật" : "Thêm khách hàng"}
            </button>

            {editingId && (
              <button
                className="secondary-btn"
                type="button"
                onClick={resetForm}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Danh sách khách hàng</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Nguồn</th>
                <th>Trạng thái</th>
                <th>Điểm AI</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.fullName}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>{customer.source}</td>
                  <td>{customer.status}</td>
                  <td>{customer.potentialScore}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className="primary-btn"
                        onClick={() => onSelectCustomer(customer.id)}
                      >
                        Chi tiết
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => editCustomer(customer)}
                      >
                        Sửa
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Customers;