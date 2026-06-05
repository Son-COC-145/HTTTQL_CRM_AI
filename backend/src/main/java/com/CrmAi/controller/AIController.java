package com.CrmAi.controller;

import com.CrmAi.dto.AIResponseDto;
import com.CrmAi.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.CrmAi.dto.ChatRequestDto;
import com.CrmAi.dto.ChatResponseDto;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AIController {

    private final AIService aiService;

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
}
