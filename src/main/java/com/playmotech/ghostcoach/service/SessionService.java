package com.playmotech.ghostcoach.service;

import com.playmotech.ghostcoach.exception.ResourceNotFoundException;
import com.playmotech.ghostcoach.model.dto.response.*;
import com.playmotech.ghostcoach.model.entity.Session;
import com.playmotech.ghostcoach.model.entity.User;
import com.playmotech.ghostcoach.model.enums.ConfidenceLevel;
import com.playmotech.ghostcoach.repository.ChatMessageRepository;
import com.playmotech.ghostcoach.repository.SessionRepository;
import com.playmotech.ghostcoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final GeminiService geminiService;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public SessionResponse uploadAndAnalyze(String userEmail, MultipartFile file) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        log.info("Processing upload for user: {} ({}), file: {} ({}KB)",
                user.getEmail(), user.getId(),
                file.getOriginalFilename(), file.getSize() / 1024);

        // Store the file
        String[] fileInfo = fileStorageService.storeFile(file);
        String storedFilename = fileInfo[0];
        String storedPath = fileInfo[1];

        // Read bytes for Gemini
        byte[] imageBytes = fileStorageService.readFileBytes(storedFilename);

        // Detect MIME type for Gemini API
        String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        // Call Gemini AI
        FeedbackResponse feedback = geminiService.analyzeStance(user, imageBytes, mimeType);

        // Persist session
        Session session = Session.builder()
                .user(user)
                .imagePath(storedPath)
                .imageFilename(storedFilename)
                .overallScore(feedback.getOverallScore())
                .strengths(feedback.getStrengths())
                .areasToImprove(feedback.getAreasToImprove())
                .priorityFix(feedback.getPriorityFix())
                .drillSuggestion(feedback.getDrillSuggestion())
                .confidenceLevel(ConfidenceLevel.valueOf(feedback.getConfidenceLevel()))
                .bodyAnnotations(feedback.getBodyAnnotations())
                .build();

        session = sessionRepository.save(session);
        log.info("Session created: {} with score: {}/10", session.getId(), session.getOverallScore());

        return mapToResponse(session);
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getUserSessions(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        log.info("Fetching sessions for user: {}, page: {}", user.getId(), pageable.getPageNumber());

        return sessionRepository.findByUserIdOrderByUploadedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSessionById(String userEmail, UUID sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Session session = sessionRepository.findByIdWithUser(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        // Verify ownership
        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Session", "id", sessionId);
        }

        return mapToResponse(session);
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getProgress(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        log.info("Fetching progress for user: {}", user.getId());

        return sessionRepository.findByUserIdOrderByUploadedAtAsc(user.getId()).stream()
                .map(session -> ProgressResponse.builder()
                        .id(session.getId())
                        .sessionDate(session.getUploadedAt())
                        .overallScore(session.getOverallScore())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompareResponse compareSessions(String userEmail, UUID id1, UUID id2) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        List<Session> sessions = sessionRepository.findByIdInAndUserId(List.of(id1, id2), user.getId());

        if (sessions.size() != 2) {
            throw new ResourceNotFoundException("One or both sessions not found");
        }

        Session s1 = sessions.stream().filter(s -> s.getId().equals(id1)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id1));
        Session s2 = sessions.stream().filter(s -> s.getId().equals(id2)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id2));

        Map<String, Object> delta = new LinkedHashMap<>();
        delta.put("scoreDifference", s2.getOverallScore() - s1.getOverallScore());
        delta.put("improved", s2.getOverallScore() > s1.getOverallScore());
        delta.put("session1Date", s1.getUploadedAt());
        delta.put("session2Date", s2.getUploadedAt());

        log.info("Compared sessions {} and {} for user {}: delta={}",
                id1, id2, user.getId(), delta.get("scoreDifference"));

        return CompareResponse.builder()
                .session1(mapToResponse(s1))
                .session2(mapToResponse(s2))
                .delta(delta)
                .build();
    }


    @Transactional
    public void deleteSession(String userEmail, UUID sessionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        // IDOR Check
        if (!session.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Session", "id", sessionId);
        }

        // 1. Delete associated chat messages
        chatMessageRepository.deleteBySessionId(sessionId);

        // 2. Delete stance image from storage
        try {
            fileStorageService.deleteFile(session.getImageFilename());
        } catch (Exception e) {
            log.error("Failed to delete stance image: {}", session.getImageFilename(), e);
        }

        // 3. Delete session
        sessionRepository.delete(session);
        log.info("Session {} successfully deleted by user {}", sessionId, user.getId());
    }

    private SessionResponse mapToResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .userId(session.getUser().getId())
                .imageUrl(fileStorageService.getFileUrl(session.getImageFilename()))
                .imageFilename(session.getImageFilename())
                .overallScore(session.getOverallScore())
                .strengths(session.getStrengths())
                .areasToImprove(session.getAreasToImprove())
                .priorityFix(session.getPriorityFix())
                .drillSuggestion(session.getDrillSuggestion())
                .confidenceLevel(session.getConfidenceLevel().name())
                .bodyAnnotations(session.getBodyAnnotations())
                .uploadedAt(session.getUploadedAt())
                .build();
    }
}
