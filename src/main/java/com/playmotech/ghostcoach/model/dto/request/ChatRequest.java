package com.playmotech.ghostcoach.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {

    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message must be under 2000 characters")
    private String message;
}
