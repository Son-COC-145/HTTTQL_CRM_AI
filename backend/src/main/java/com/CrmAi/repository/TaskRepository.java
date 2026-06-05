package com.CrmAi.repository;

import com.CrmAi.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCustomerId(Long customerId);

    Long countByStatus(String status);
}
