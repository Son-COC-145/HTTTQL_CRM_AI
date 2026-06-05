package com.CrmAi.service;

import com.CrmAi.entity.AIAnalysis;
import com.CrmAi.repository.AIAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final AIAnalysisRepository aiAnalysisRepository;

    public List<AIAnalysis> getAnalysisByCustomerId(Long customerId) {
        return aiAnalysisRepository.findByCustomerId(customerId);
    }
}
