package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressResponse {

    private UUID id;
    private Instant sessionDate;
    private Integer overallScore;
}
