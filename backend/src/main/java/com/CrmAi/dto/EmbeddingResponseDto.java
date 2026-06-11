package com.CrmAi.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmbeddingResponseDto {
    private Long customerId;
    private List<Double> embedding;
}