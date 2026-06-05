package com.CrmAi.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChartDataDto {
    private String name;
    private Long value;
}
