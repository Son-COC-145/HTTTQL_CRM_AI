package com.CrmAi.repository;

import com.CrmAi.entity.AiChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiChatHistoryRepository extends JpaRepository<AiChatHistory,Long> {
    List<AiChatHistory> findTop20ByOrderByCreatedAtDesc();
}