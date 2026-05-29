package com.playmotech.ghostcoach.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @NotBlank(message = "Sport is required")
    private String sport;

    @NotBlank(message = "Position/role is required")
    @Size(max = 100, message = "Position must be under 100 characters")
    private String positionRole;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    @NotNull(message = "Age is required")
    @Min(value = 5, message = "Age must be at least 5")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;
}
