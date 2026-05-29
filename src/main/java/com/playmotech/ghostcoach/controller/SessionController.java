package com.playmotech.ghostcoach.controller;

import com.playmotech.ghostcoach.model.dto.response.*;
import com.playmotech.ghostcoach.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<SessionResponse>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Upload request from: {}", email);
        SessionResponse response = sessionService.uploadAndAnalyze(email, file);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Image analyzed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<SessionResponse> sessionsPage = sessionService.getUserSessions(email, pageable);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("sessions", sessionsPage.getContent());
        responseData.put("totalCount", sessionsPage.getTotalElements());
        responseData.put("page", sessionsPage.getNumber());
        responseData.put("totalPages", sessionsPage.getTotalPages());

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(
            @PathVariable UUID id,
            Authentication authentication) {
        String email = authentication.getName();
        SessionResponse response = sessionService.getSessionById(email, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getProgress(
            Authentication authentication) {
        String email = authentication.getName();
        List<ProgressResponse> progress = sessionService.getProgress(email);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/compare")
    public ResponseEntity<ApiResponse<CompareResponse>> compareSessions(
            @RequestParam UUID id1,
            @RequestParam UUID id2,
            Authentication authentication) {
        String email = authentication.getName();
        CompareResponse response = sessionService.compareSessions(email, id1, id2);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable UUID id,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Delete request for session {} from: {}", id, email);
        sessionService.deleteSession(email, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Session deleted successfully"));
    }
}
