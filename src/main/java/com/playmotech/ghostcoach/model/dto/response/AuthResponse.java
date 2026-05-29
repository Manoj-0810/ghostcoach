package com.playmotech.ghostcoach.model.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private UserResponse user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private UUID id;
        private String fullName;
        private String email;
        private String sport;
        private String positionRole;
        private String experienceLevel;
        private Integer age;
    }
}
