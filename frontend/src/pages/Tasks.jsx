import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách task!");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status,
        dueDate: task.dueDate,
      });

      toast.success("Cập nhật trạng thái thành công!");
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật task thất bại!");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa task này?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Xóa task thành công!");
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Xóa task thất bại!");
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "DEADLINE_ASC") {
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      }

      if (sortBy === "DEADLINE_DESC") {
        return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
      }

      return 0;
    });

  const getStatusLabel = (status) => {
    if (status === "TODO") return "Chưa làm";
    if (status === "IN_PROGRESS") return "Đang xử lý";
    if (status === "DONE") return "Hoàn thành";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "TODO") return "status-todo";
    if (status === "IN_PROGRESS") return "status-in-progress";
    if (status === "DONE") return "status-done";
    return "";
  };

  return (
    <div>
      <h1 className="page-title">Quản lý công việc chăm sóc</h1>
      <p className="page-subtitle">
        Theo dõi các task chăm sóc khách hàng và cập nhật trạng thái xử lý.
      </p>

      <div className="filter-bar">
        <input
          placeholder="Tìm task theo tiêu đề hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="TODO">Chưa làm</option>
          <option value="IN_PROGRESS">Đang xử lý</option>
          <option value="DONE">Hoàn thành</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="DEFAULT">Mặc định</option>
          <option value="DEADLINE_ASC">Deadline gần nhất</option>
          <option value="DEADLINE_DESC">Deadline xa nhất</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Deadline</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>
                    <strong>{task.title}</strong>
                  </td>
                  <td>{task.description}</td>
                  <td>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleString()
                      : "Chưa có"}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td>
                    <div className="task-actions">
                      <button
                        className="secondary-btn"
                        onClick={() => updateStatus(task, "IN_PROGRESS")}
                      >
                        Đang làm
                      </button>

                      <button
                        className="primary-btn"
                        onClick={() => updateStatus(task, "DONE")}
                      >
                        Hoàn thành
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => deleteTask(task.id)}
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

export default Tasks;