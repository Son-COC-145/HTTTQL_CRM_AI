package com.CrmAi.service;

import com.CrmAi.dto.AIResponseDto;
import com.CrmAi.entity.AIAnalysis;
import com.CrmAi.entity.Customer;
import com.CrmAi.entity.Order;
import com.CrmAi.entity.Task;
import com.CrmAi.repository.AIAnalysisRepository;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.InteractionRepository;
import com.CrmAi.repository.OrderRepository;
import com.CrmAi.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.CrmAi.dto.ChatResponseDto;
import com.CrmAi.dto.RevenueForecastResponseDto;

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
    private final AiChatHistoryService chatHistoryService;

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
        String lowerQuestion = question.toLowerCase();

        StringBuilder context = new StringBuilder();

        context.append("Dữ liệu CRM liên quan đến câu hỏi:\n\n");

        if (
                lowerQuestion.contains("tiềm năng") ||
                        lowerQuestion.contains("hot") ||
                        lowerQuestion.contains("ưu tiên") ||
                        lowerQuestion.contains("chăm sóc trước")
        ) {
            List<Customer> customers =
                    customerRepository.findTop10ByOrderByPotentialScoreDesc();

            context.append("Top khách hàng có điểm AI cao nhất:\n");

            for (Customer c : customers) {
                context.append("- Tên: ")
                        .append(c.getFullName())
                        .append(", trạng thái: ")
                        .append(c.getStatus())
                        .append(", điểm AI: ")
                        .append(c.getPotentialScore())
                        .append(", nguồn: ")
                        .append(c.getSource())
                        .append(", ghi chú: ")
                        .append(c.getNote())
                        .append(".\n");
            }

        } else if (
                lowerQuestion.contains("inactive") ||
                        lowerQuestion.contains("không hoạt động") ||
                        lowerQuestion.contains("ngừng hoạt động")
        ) {
            List<Customer> customers =
                    customerRepository.findByStatus("INACTIVE");

            context.append("Danh sách khách hàng không hoạt động:\n");

            for (Customer c : customers) {
                context.append("- Tên: ")
                        .append(c.getFullName())
                        .append(", điểm AI: ")
                        .append(c.getPotentialScore())
                        .append(", nguồn: ")
                        .append(c.getSource())
                        .append(", ghi chú: ")
                        .append(c.getNote())
                        .append(".\n");
            }

        } else if (
                lowerQuestion.contains("task") ||
                        lowerQuestion.contains("công việc") ||
                        lowerQuestion.contains("deadline") ||
                        lowerQuestion.contains("việc cần làm")
        ) {
            List<Task> tasks =
                    taskRepository.findByStatusIn(List.of("TODO", "IN_PROGRESS"));

            context.append("Các task chưa hoàn thành:\n");

            for (Task t : tasks) {
                context.append("- Task: ")
                        .append(t.getTitle())
                        .append(", mô tả: ")
                        .append(t.getDescription())
                        .append(", trạng thái: ")
                        .append(t.getStatus())
                        .append(", hạn xử lý: ")
                        .append(t.getDueDate())
                        .append(".\n");
            }

        } else if (
                lowerQuestion.contains("facebook")
        ) {
            List<Customer> customers =
                    customerRepository.findBySourceIgnoreCase("Facebook");

            context.append("Khách hàng từ nguồn Facebook:\n");

            for (Customer c : customers) {
                context.append("- Tên: ")
                        .append(c.getFullName())
                        .append(", trạng thái: ")
                        .append(c.getStatus())
                        .append(", điểm AI: ")
                        .append(c.getPotentialScore())
                        .append(".\n");
            }

        } else if (
                lowerQuestion.contains("website")
        ) {
            List<Customer> customers =
                    customerRepository.findBySourceIgnoreCase("Website");

            context.append("Khách hàng từ nguồn Website:\n");

            for (Customer c : customers) {
                context.append("- Tên: ")
                        .append(c.getFullName())
                        .append(", trạng thái: ")
                        .append(c.getStatus())
                        .append(", điểm AI: ")
                        .append(c.getPotentialScore())
                        .append(".\n");
            }

        } else {
            List<Customer> customers =
                    customerRepository.findTop10ByOrderByPotentialScoreDesc();

            context.append("Tóm tắt top 10 khách hàng nổi bật:\n");

            for (Customer c : customers) {
                context.append("- Tên: ")
                        .append(c.getFullName())
                        .append(", trạng thái: ")
                        .append(c.getStatus())
                        .append(", điểm AI: ")
                        .append(c.getPotentialScore())
                        .append(", nguồn: ")
                        .append(c.getSource())
                        .append(".\n");
            }
        }

        Map<String, Object> request = new HashMap<>();
        request.put("question", question);
        request.put("context", context.toString());

        ChatResponseDto response = restTemplate.postForObject(
                "http://localhost:8000/ai/chat",
                request,
                ChatResponseDto.class
        );

        if (response != null) {
            chatHistoryService.save(question, response.getAnswer());
        }

        return response;
    }
    
    public RevenueForecastResponseDto forecastRevenue(List<Double> monthlyRevenue) {
        Map<String, Object> request = new HashMap<>();
        request.put("monthlyRevenue", monthlyRevenue);

        return restTemplate.postForObject(
                "http://localhost:8000/ai/forecast-revenue",
                request,
                RevenueForecastResponseDto.class
        );
    }

    public Object churnRisk(Long customerId) {
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
        request.put("potential_score", customer.getPotentialScore());
        request.put("interaction_count", interactionCount);
        request.put("order_count", orderCount);
        request.put("total_spent", totalSpent);
        request.put("task_count", taskCount);

        return restTemplate.postForObject(
                "http://localhost:8000/ai/churn-risk",
                request,
                Object.class
        );
    }
}