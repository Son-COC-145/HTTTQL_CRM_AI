package com.CrmAi.controller;

import com.CrmAi.entity.Task;
import com.CrmAi.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/customer/{customerId}")
    public List<Task> getTasksByCustomer(@PathVariable Long customerId) {
        return taskService.getTasksByCustomerId(customerId);
    }

    @PostMapping("/customer/{customerId}")
    public Task createTask(@PathVariable Long customerId, @RequestBody Task task) {
        return taskService.createTask(customerId, task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        return taskService.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Deleted task successfully";
    }
}
