package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompareResponse {

    private SessionResponse session1;
    private SessionResponse session2;
    private Map<String, Object> delta;
}
