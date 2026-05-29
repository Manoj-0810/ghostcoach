package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {

    private UUID id;
    private UUID userId;
    private String imageUrl;
    private String imageFilename;
    private Integer overallScore;
    private List<String> strengths;
    private List<Map<String, String>> areasToImprove;
    private String priorityFix;
    private String drillSuggestion;
    private String confidenceLevel;
    private List<Map<String, String>> bodyAnnotations;
    private Instant uploadedAt;
}
