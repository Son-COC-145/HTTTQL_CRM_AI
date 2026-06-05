package com.CrmAi.service;

import com.CrmAi.dto.DashboardDto;
import com.CrmAi.repository.CustomerRepository;
import com.CrmAi.repository.OrderRepository;
import com.CrmAi.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import com.CrmAi.dto.ChartDataDto;
import com.CrmAi.dto.RevenueChartDto;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final TaskRepository taskRepository;

    public DashboardDto getDashboardStats() {
        BigDecimal revenue = orderRepository.getTotalRevenue();

        List<ChartDataDto> customerSources = customerRepository.countCustomersBySource()
                .stream()
                .map(row -> ChartDataDto.builder()
                        .name((String) row[0])
                        .value((Long) row[1])
                        .build())
                .toList();

        List<ChartDataDto> customerStatuses = customerRepository.countCustomersByStatus()
                .stream()
                .map(row -> ChartDataDto.builder()
                        .name((String) row[0])
                        .value((Long) row[1])
                        .build())
                .toList();

        List<RevenueChartDto> monthlyRevenue = orderRepository.getMonthlyRevenue()
                .stream()
                .map(row -> RevenueChartDto.builder()
                        .month((String) row[0])
                        .revenue(((Number) row[1]).doubleValue())
                        .build())
                .toList();

        return DashboardDto.builder()
                .totalCustomers(customerRepository.count())
                .totalOrders(orderRepository.count())
                .totalRevenue(revenue.doubleValue())
                .hotCustomers(customerRepository.countByPotentialScoreGreaterThanEqual(80))
                .warmCustomers(customerRepository.countByPotentialScoreBetween(60, 79))
                .coldCustomers(customerRepository.countByPotentialScoreLessThan(60))
                .pendingTasks(taskRepository.countByStatus("TODO"))
                .customerSources(customerSources)
                .customerStatuses(customerStatuses)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }
}
