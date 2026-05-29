package com.playmotech.ghostcoach.service;

import com.playmotech.ghostcoach.exception.ResourceNotFoundException;
import com.playmotech.ghostcoach.model.dto.response.ChatResponse;
import com.playmotech.ghostcoach.model.entity.ChatMessage;
import com.playmotech.ghostcoach.model.entity.Session;
import com.playmotech.ghostcoach.model.entity.User;
import com.playmotech.ghostcoach.repository.ChatMessageRepository;
import com.playmotech.ghostcoach.repository.SessionRepository;
import com.playmotech.ghostcoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    @Transactional
    public ChatResponse sendMessage(String userEmail, UUID sessionId, String userMessage) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Session session = sessionRepository.findByIdWithUser(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        // Verify ownership
        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Session", "id", sessionId);
        }

        log.info("Chat message from user: {} for session: {}", user.getId(), sessionId);

        // Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .role("USER")
                .content(userMessage)
                .build();
        chatMessageRepository.save(userMsg);

        // Build conversation history
        List<ChatMessage> history = chatMessageRepository
                .findBySessionIdOrderByCreatedAtAsc(sessionId);

        List<Map<String, String>> conversationHistory = history.stream()
                .filter(msg -> !msg.getId().equals(userMsg.getId())) // Exclude current message (added separately)
                .map(msg -> {
                    Map<String, String> entry = new LinkedHashMap<>();
                    entry.put("role", msg.getRole());
                    entry.put("content", msg.getContent());
                    return entry;
                })
                .collect(Collectors.toList());

        // Call Gemini for response
        String aiResponse = geminiService.chat(user, session, conversationHistory, userMessage);

        // Save assistant message
        ChatMessage assistantMsg = ChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .build();
        assistantMsg = chatMessageRepository.saveAndFlush(assistantMsg);

        log.info("Chat response generated for session: {} ({} chars)", sessionId, aiResponse.length());

        java.time.Instant responseTime = assistantMsg.getCreatedAt() != null ? assistantMsg.getCreatedAt() : java.time.Instant.now();

        return ChatResponse.builder()
                .role("ASSISTANT")
                .content(aiResponse)
                .createdAt(responseTime)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getChatHistory(String userEmail, UUID sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Session session = sessionRepository.findByIdWithUser(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        // Verify ownership
        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Session", "id", sessionId);
        }

        log.info("Fetching chat history for session: {}", sessionId);

        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(msg -> ChatResponse.builder()
                        .role(msg.getRole())
                        .content(msg.getContent())
                        .createdAt(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
