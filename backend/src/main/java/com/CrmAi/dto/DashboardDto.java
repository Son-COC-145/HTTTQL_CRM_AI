package com.CrmAi.dto;

import lombok.*;

import java.util.List;

@Setter @Getter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardDto {

    private Long totalCustomers;

    private Long totalOrders;

    private Double totalRevenue;

    private Long hotCustomers;

    private Long warmCustomers;

    private Long coldCustomers;

    private Long pendingTasks;

    private List<ChartDataDto> customerSources;

    private List<ChartDataDto> customerStatuses;

    private List<RevenueChartDto> monthlyRevenue;
}
