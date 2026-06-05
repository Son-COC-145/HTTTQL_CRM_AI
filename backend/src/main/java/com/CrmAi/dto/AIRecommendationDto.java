package com.CrmAi.dto;

import lombok.*;

import java.util.List;

@Setter @Getter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AIRecommendationDto {

    private Long customerId;

    private String customerName;

    private String priority;

    private List<String> recommendations;
}
