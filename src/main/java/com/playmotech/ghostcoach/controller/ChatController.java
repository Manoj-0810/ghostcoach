package com.playmotech.ghostcoach.controller;

import com.playmotech.ghostcoach.model.dto.request.ChatRequest;
import com.playmotech.ghostcoach.model.dto.response.ApiResponse;
import com.playmotech.ghostcoach.model.dto.response.ChatResponse;
import com.playmotech.ghostcoach.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sessions/{sessionId}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @PathVariable UUID sessionId,
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Chat message from {} for session {}", email, sessionId);
        ChatResponse response = chatService.sendMessage(email, sessionId, request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(response, "Message sent"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getChatHistory(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        String email = authentication.getName();
        List<ChatResponse> history = chatService.getChatHistory(email, sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
