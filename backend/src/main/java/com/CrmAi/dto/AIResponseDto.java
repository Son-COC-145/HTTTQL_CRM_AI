package com.CrmAi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AIResponseDto {

    private Integer potentialScore;

    private String level;

    private String summary;

    private String suggestedAction;
}
