package com.CrmAi.dto;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueChartDto {
    private String month;
    private Double revenue;
}
