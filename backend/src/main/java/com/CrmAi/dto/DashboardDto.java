package com.CrmAi.dto;

import lombok.*;

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
}
