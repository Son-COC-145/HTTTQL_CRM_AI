import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <h1 className="page-title">Quản lý công việc chăm sóc</h1>
      <p className="page-subtitle">
        Theo dõi các task chăm sóc khách hàng và cập nhật trạng thái xử lý.
      </p>

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
              {tasks.map((task) => (
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
                    <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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