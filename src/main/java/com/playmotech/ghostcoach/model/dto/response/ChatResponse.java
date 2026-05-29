package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {

    private String role;
    private String content;
    private Instant createdAt;
}
