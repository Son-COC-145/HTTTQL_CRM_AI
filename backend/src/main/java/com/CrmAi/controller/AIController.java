package com.CrmAi.controller;

import com.CrmAi.dto.AIResponseDto;
import com.CrmAi.entity.AiChatHistory;
import com.CrmAi.service.AIService;
import com.CrmAi.service.AiChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.CrmAi.dto.ChatRequestDto;
import com.CrmAi.dto.ChatResponseDto;
import com.CrmAi.dto.RevenueForecastResponseDto;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AIController {

    private final AIService aiService;
    private final AiChatHistoryService chatHistoryService;

    @PostMapping("/analyze-customer/{customerId}")
    public AIResponseDto analyzeCustomerById(@PathVariable Long customerId) {
        return aiService.analyzeCustomerById(customerId);
    }

    @PostMapping("/recommend-action/{customerId}")
    public Object recommendAction(@PathVariable Long customerId) {
        return aiService.recommendAction(customerId);
    }

    @PostMapping("/chat")
    public ChatResponseDto chat(@RequestBody ChatRequestDto request) {
        return aiService.chat(request.getQuestion());
    }

    @GetMapping("/history")
    public List<AiChatHistory> getChatHistory() {
        return chatHistoryService.getRecentHistory();
    }

    @PostMapping("/forecast-revenue")
    public RevenueForecastResponseDto forecastRevenue(@RequestBody List<Double> monthlyRevenue) {
        return aiService.forecastRevenue(monthlyRevenue);
    }

    @PostMapping("/churn-risk/{customerId}")
    public Object churnRisk(@PathVariable Long customerId) {
        return aiService.churnRisk(customerId);
    }
}
