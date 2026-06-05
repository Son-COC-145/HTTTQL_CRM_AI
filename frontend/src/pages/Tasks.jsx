import { useEffect, useState } from "react";
import api from "../api/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    api.get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(console.error);
  };

  const updateStatus = async (task, status) => {
    await api.put(`/tasks/${task.id}`, {
      title: task.title,
      description: task.description,
      status,
      dueDate: task.dueDate,
    });

    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div>
      <h1>Quản lý công việc chăm sóc</h1>

      <table className="table">
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
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleString()
                  : "Chưa có"}
              </td>
              <td>{task.status}</td>
              <td>
                <button
                  className="secondary-btn"
                  onClick={() => updateStatus(task, "IN_PROGRESS")}
                >
                  Đang làm
                </button>

                <button
                  className="primary-btn"
                  onClick={() => updateStatus(task, "DONE")}
                  style={{ marginLeft: "8px" }}
                >
                  Hoàn thành
                </button>

                <button
                  className="danger-btn"
                  onClick={() => deleteTask(task.id)}
                  style={{ marginLeft: "8px" }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tasks;