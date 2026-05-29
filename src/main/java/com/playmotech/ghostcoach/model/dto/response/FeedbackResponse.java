package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Integer overallScore;
    private List<String> strengths;
    private List<Map<String, String>> areasToImprove;
    private String priorityFix;
    private String drillSuggestion;
    private String confidenceLevel;
    private List<Map<String, String>> bodyAnnotations;
}
