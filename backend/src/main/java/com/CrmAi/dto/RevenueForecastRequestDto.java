package com.CrmAi.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
public class RevenueForecastRequestDto {
    private List<Double> monthlyRevenue;
}