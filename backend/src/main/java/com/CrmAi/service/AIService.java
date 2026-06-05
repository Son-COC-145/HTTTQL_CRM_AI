package com.CrmAi.service;

import com.CrmAi.dto.AIResponseDto;
import com.CrmAi.entity.AIAnalysis;
import com.CrmAi.entity.Customer;
import com.CrmAi.entity.Order;
import com.CrmAi.repository.AIAnalysisRepository;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.InteractionRepository;
import com.CrmAi.repository.OrderRepository;
import com.CrmAi.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.CrmAi.dto.ChatResponseDto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate;

    private final CustomerRepository customerRepository;
    private final InteractionRepository interactionRepository;
    private final OrderRepository orderRepository;
    private final TaskRepository taskRepository;
    private final AIAnalysisRepository aiAnalysisRepository;

    public AIResponseDto analyzeCustomerById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        int interactionCount = interactionRepository.findByCustomerId(customerId).size();

        List<Order> orders = orderRepository.findByCustomerId(customerId);
        int orderCount = orders.size();

        BigDecimal totalSpent = orders.stream()
                .map(Order::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int taskCount = taskRepository.findByCustomerId(customerId).size();

        Map<String, Object> request = new HashMap<>();
        request.put("customer_id", customer.getId());
        request.put("full_name", customer.getFullName());
        request.put("status", customer.getStatus());
        request.put("source", customer.getSource());
        request.put("note", customer.getNote());
        request.put("interaction_count", interactionCount);
        request.put("order_count", orderCount);
        request.put("total_spent", totalSpent);
        request.put("task_count", taskCount);

        String url = "http://localhost:8000/ai/analyze-customer";

        AIResponseDto response = restTemplate.postForObject(
                url,
                request,
                AIResponseDto.class
        );

        if (response == null) {
            throw new RuntimeException("AI service response is null");
        }

        AIAnalysis analysis = AIAnalysis.builder()
                .customer(customer)
                .potentialScore(response.getPotentialScore())
                .level(response.getLevel())
                .summary(response.getSummary())
                .suggestedAction(response.getSuggestedAction())
                .build();

        aiAnalysisRepository.save(analysis);

        customer.setPotentialScore(response.getPotentialScore());
        customerRepository.save(customer);

        return response;
    }

    public Object recommendAction(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        int interactionCount = interactionRepository.findByCustomerId(customerId).size();

        List<Order> orders = orderRepository.findByCustomerId(customerId);

        BigDecimal totalSpent = orders.stream()
                .map(Order::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int taskCount = taskRepository.findByCustomerId(customerId).size();

        Map<String, Object> request = new HashMap<>();
        request.put("customer_id", customer.getId());
        request.put("full_name", customer.getFullName());
        request.put("level", customer.getPotentialScore() >= 80 ? "HOT" : customer.getPotentialScore() >= 60 ? "WARM" : "COLD");
        request.put("total_spent", totalSpent);
        request.put("interaction_count", interactionCount);
        request.put("task_count", taskCount);

        String url = "http://localhost:8000/ai/recommend-action";

        return restTemplate.postForObject(url, request, Object.class);
    }

    public ChatResponseDto chat(String question) {
        List<Customer> customers = customerRepository.findAll();

        Customer topCustomer = customers.stream()
                .filter(c -> c.getPotentialScore() != null)
                .max((c1, c2) -> c1.getPotentialScore().compareTo(c2.getPotentialScore()))
                .orElse(null);

        StringBuilder context = new StringBuilder();

        context.append("Tổng số khách hàng: ")
                .append(customers.size())
                .append(".\n");

        if (topCustomer != null) {
            context.append("Khách hàng tiềm năng nhất: ")
                    .append(topCustomer.getFullName())
                    .append(", điểm AI: ")
                    .append(topCustomer.getPotentialScore())
                    .append(", trạng thái: ")
                    .append(topCustomer.getStatus())
                    .append(".\n");
        }

        for (Customer c : customers) {
            context.append("- ")
                    .append(c.getFullName())
                    .append(" | điểm AI: ")
                    .append(c.getPotentialScore())
                    .append(" | trạng thái: ")
                    .append(c.getStatus())
                    .append(" | nguồn: ")
                    .append(c.getSource())
                    .append(".\n");
        }

        Map<String, Object> request = new HashMap<>();
        request.put("question", question);
        request.put("context", context.toString());

        String url = "http://localhost:8000/ai/chat";

        return restTemplate.postForObject(url, request, ChatResponseDto.class);
    }
}