package com.CrmAi.controller;

import com.CrmAi.entity.AIAnalysis;
import com.CrmAi.service.AIAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-analysis")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    @GetMapping("/customer/{customerId}")
    public List<AIAnalysis> getAnalysisByCustomer(@PathVariable Long customerId) {
        return aiAnalysisService.getAnalysisByCustomerId(customerId);
    }
}
