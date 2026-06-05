package com.CrmAi.repository;

import com.CrmAi.entity.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {
    List<AIAnalysis> findByCustomerId(Long customerId);
}
