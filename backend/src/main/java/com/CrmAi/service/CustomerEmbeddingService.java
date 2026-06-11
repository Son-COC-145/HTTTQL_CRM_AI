package com.CrmAi.service;

import com.CrmAi.dto.EmbeddingResponseDto;
import com.CrmAi.entity.Customer;
import com.CrmAi.entity.CustomerEmbedding;
import com.CrmAi.repository.CustomerEmbeddingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerEmbeddingService {

    private final CustomerEmbeddingRepository embeddingRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void syncCustomerEmbedding(Customer customer) {
        try {
            String content = buildCustomerContent(customer);

            Map<String, Object> request = new HashMap<>();
            request.put("customerId", customer.getId());
            request.put("content", content);

            EmbeddingResponseDto response = restTemplate.postForObject(
                    "http://localhost:8000/embedding",
                    request,
                    EmbeddingResponseDto.class
            );

            if (response == null || response.getEmbedding() == null) {
                return;
            }

            String embeddingJson = objectMapper.writeValueAsString(response.getEmbedding());

            CustomerEmbedding embedding = embeddingRepository
                    .findByCustomerId(customer.getId())
                    .orElse(CustomerEmbedding.builder()
                            .customerId(customer.getId())
                            .build());

            embedding.setContent(content);
            embedding.setEmbeddingJson(embeddingJson);

            embeddingRepository.save(embedding);

        } catch (Exception e) {
            System.out.println("Không thể đồng bộ embedding cho customer id = " + customer.getId());
            System.out.println(e.getMessage());
        }
    }

    @Transactional
    public void deleteByCustomerId(Long customerId) {
        embeddingRepository.deleteByCustomerId(customerId);
    }

    private String buildCustomerContent(Customer customer) {
        return """
                Tên khách hàng: %s
                Trạng thái: %s
                Nguồn khách hàng: %s
                Điểm AI: %s
                Ghi chú: %s
                """.formatted(
                customer.getFullName(),
                customer.getStatus(),
                customer.getSource(),
                customer.getPotentialScore(),
                customer.getNote()
        );
    }
}