package com.CrmAi.service;

import com.CrmAi.dto.DashboardDto;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.OrderRepository;
import com.CrmAi.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final TaskRepository taskRepository;

    public DashboardDto getDashboardStats() {
        BigDecimal revenue = orderRepository.getTotalRevenue();

        return DashboardDto.builder()
                .totalCustomers(customerRepository.count())
                .totalOrders(orderRepository.count())
                .totalRevenue(revenue.doubleValue())
                .hotCustomers(customerRepository.countByPotentialScoreGreaterThanEqual(80))
                .warmCustomers(customerRepository.countByPotentialScoreBetween(60, 79))
                .coldCustomers(customerRepository.countByPotentialScoreLessThan(60))
                .pendingTasks(taskRepository.countByStatus("TODO"))
                .build();
    }
}
