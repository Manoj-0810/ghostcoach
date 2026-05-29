package com.playmotech.ghostcoach.service;

import com.playmotech.ghostcoach.config.GeminiConfig;
import com.playmotech.ghostcoach.exception.GeminiServiceException;
import com.playmotech.ghostcoach.model.entity.Session;
import com.playmotech.ghostcoach.model.entity.User;
import com.playmotech.ghostcoach.model.dto.response.FeedbackResponse;
import com.playmotech.ghostcoach.util.GeminiResponseParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GeminiService {

    private final WebClient geminiWebClient;
    private final GeminiConfig geminiConfig;
    private final GeminiResponseParser responseParser;

    public GeminiService(WebClient geminiWebClient, GeminiConfig geminiConfig,
                         GeminiResponseParser responseParser) {
        this.geminiWebClient = geminiWebClient;
        this.geminiConfig = geminiConfig;
        this.responseParser = responseParser;
        log.info("GeminiService initialized with model: {}", geminiConfig.getModel());
    }

    /**
     * CALL 1 — Stance Analysis
     * Sends an image to Gemini with a sport-specific coaching prompt.
     */
    public FeedbackResponse analyzeStance(User user, byte[] imageBytes, String mimeType) {
        String systemPrompt = buildStanceAnalysisPrompt(user);
        log.info("Analyzing stance for user: {} ({}), sport: {}", user.getFullName(), user.getId(), user.getSport());
        log.debug("Stance analysis system prompt: {}", systemPrompt);

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        Map<String, Object> requestBody = buildImageRequest(systemPrompt, base64Image, mimeType);
        String rawResponse = callGeminiApi(requestBody);

        return responseParser.parseFeedback(rawResponse);
    }

    /**
     * CALL 2 — Coaching Chat
     * Sends a follow-up question with session context and conversation history.
     */
    public String chat(User user, Session session, List<Map<String, String>> conversationHistory, String userMessage) {
        String systemPrompt = buildChatPrompt(user, session);
        log.info("Chat request for session: {}, user: {}", session.getId(), user.getId());
        log.debug("Chat system prompt: {}", systemPrompt);

        Map<String, Object> requestBody = buildChatRequest(systemPrompt, conversationHistory, userMessage);
        return callGeminiApi(requestBody);
    }

    private String buildStanceAnalysisPrompt(User user) {
        return String.format("""
                You are an elite %s coach with 20 years of professional experience \
                specializing in technique analysis at youth and semi-professional level.
                
                You are reviewing a stance photo submitted by a %s-level %s \
                in %s, aged %d. Calibrate every piece of feedback precisely to this profile:
                - BEGINNER: foundational corrections, encouraging tone, avoid jargon
                - INTERMEDIATE: technical specificity, reference named techniques
                - ADVANCED: precision corrections, competitive-level detail
                
                Analyze the player's technique in this image and respond ONLY with a valid JSON \
                object. No markdown. No preamble. No code blocks. Only the raw JSON object below:
                
                {
                  "overallScore": <integer 1-10>,
                  "strengths": ["<observation>", "<observation>"],
                  "areasToImprove": [
                    {"issue": "<short label>", "explanation": "<plain English, 1-2 sentences>"},
                    {"issue": "<short label>", "explanation": "<plain English, 1-2 sentences>"}
                  ],
                  "priorityFix": "<single most critical correction as a direct instruction>",
                  "drillSuggestion": "<named drill + 1 sentence on how to perform it>",
                  "confidenceLevel": "<LOW|MEDIUM|HIGH>",
                  "bodyAnnotations": [
                    {"label": "<body part>", "description": "<what to fix>", "importance": "<HIGH|MEDIUM|LOW>"},
                    {"label": "<body part>", "description": "<what to fix>", "importance": "<HIGH|MEDIUM|LOW>"}
                  ]
                }
                
                If you cannot clearly identify a stance, set confidenceLevel to LOW and \
                explain the limitation in areasToImprove. Do not guess at sport-specific \
                details you cannot see in the image.""",
                user.getSport().name(),
                user.getExperienceLevel().name(),
                user.getPositionRole(),
                user.getSport().name(),
                user.getAge()
        );
    }

    private String buildChatPrompt(User user, Session session) {
        String areasFormatted = "";
        if (session.getAreasToImprove() != null) {
            areasFormatted = session.getAreasToImprove().stream()
                    .map(area -> "- " + area.get("issue") + ": " + area.get("explanation"))
                    .collect(Collectors.joining("\n"));
        }

        return String.format("""
                You are Ghost Coach — an expert %s coaching assistant having a follow-up \
                conversation with a %s %s, aged %d.
                
                Their last session analysis:
                - Overall Score: %d/10
                - Priority Fix: %s
                - Drill Suggested: %s
                - Areas to Improve:
                %s
                
                Answer as a knowledgeable, direct coach. Keep responses under 150 words. \
                Be specific to %s and their experience level. No generic advice. \
                Always use double-newlines before numbered steps, bullet points, or distinct coaching cues \
                so the text is spaced out beautifully and highly comfortable to read in a messaging bubble.""",
                user.getSport().name(),
                user.getExperienceLevel().name(),
                user.getPositionRole(),
                user.getAge(),
                session.getOverallScore(),
                session.getPriorityFix(),
                session.getDrillSuggestion(),
                areasFormatted,
                user.getSport().name()
        );
    }

    private Map<String, Object> buildImageRequest(String systemPrompt, String base64Image, String mimeType) {
        Map<String, Object> inlineData = new LinkedHashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);

        Map<String, Object> imagePart = Map.of("inlineData", inlineData);
        Map<String, Object> textPart = Map.of("text", systemPrompt);

        Map<String, Object> content = Map.of(
                "parts", List.of(textPart, imagePart)
        );

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("temperature", 0.4);
        generationConfig.put("maxOutputTokens", 4096);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("contents", List.of(content));
        request.put("generationConfig", generationConfig);
        return request;
    }

    private Map<String, Object> buildChatRequest(String systemPrompt,
                                                   List<Map<String, String>> history,
                                                   String userMessage) {
        List<Map<String, Object>> contents = new ArrayList<>();

        // System instruction as first user turn
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", systemPrompt + "\n\nNow continue the conversation."))
        ));
        contents.add(Map.of(
                "role", "model",
                "parts", List.of(Map.of("text", "Understood. I'm ready to coach. Ask me anything about your session."))
        ));

        // Add conversation history
        for (Map<String, String> msg : history) {
            String role = msg.get("role").equals("USER") ? "user" : "model";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.get("content")))
            ));
        }

        // Add current user message
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
        ));

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 4096);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("contents", contents);
        request.put("generationConfig", generationConfig);
        return request;
    }

    private String callGeminiApi(Map<String, Object> requestBody) {
        String primaryModel = geminiConfig.getModel();
        String fallbackModel = primaryModel.equals("gemini-2.5-flash") ? "gemini-1.5-flash" : "gemini-2.5-flash";

        int maxRetries = 3;
        int delayMs = 1500;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            // On the last attempt, try the fallback model in case of high demand
            String modelToUse = (attempt == maxRetries) ? fallbackModel : primaryModel;
            
            String endpoint = String.format("/models/%s:generateContent?key=%s",
                    modelToUse, geminiConfig.getApiKey());

            log.debug("Calling Gemini API endpoint: /models/{}:generateContent (attempt {}/{})", 
                    modelToUse, attempt, maxRetries);

            try {
                Map response = geminiWebClient.post()
                        .uri(endpoint)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (response == null) {
                    throw new GeminiServiceException("Empty response from Gemini API");
                }

                log.debug("Gemini API raw response: {}", response);

                // Extract text from response
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates == null || candidates.isEmpty()) {
                    // Check for prompt feedback (blocked content)
                    Map promptFeedback = (Map) response.get("promptFeedback");
                    if (promptFeedback != null) {
                        String blockReason = String.valueOf(promptFeedback.get("blockReason"));
                        log.error("Gemini blocked the request. Reason: {}", blockReason);
                        throw new GeminiServiceException(
                                "The AI could not analyze this image. Please try a different photo.");
                    }
                    throw new GeminiServiceException("No response generated by AI");
                }

                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

                if (parts == null || parts.isEmpty()) {
                    throw new GeminiServiceException("AI response contained no content");
                }

                String text = (String) parts.get(0).get("text");
                log.debug("Gemini extracted text: {}", text);
                return text;

            } catch (WebClientResponseException e) {
                int status = e.getStatusCode().value();
                log.warn("Gemini API HTTP error (attempt {}/{} using model {}): {} - {}", 
                        attempt, maxRetries, modelToUse, status, e.getResponseBodyAsString());
                
                // If it is a 503, 429 or other 5xx transient error, wait and retry
                if ((status == 503 || status == 429 || status >= 500) && attempt < maxRetries) {
                    try {
                        Thread.sleep(delayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new GeminiServiceException("AI communication interrupted", ie);
                    }
                    continue;
                }
                
                throw new GeminiServiceException("AI service returned an error: " + e.getStatusCode(), e);
            } catch (GeminiServiceException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Unexpected error calling Gemini API (attempt {}/{} using model {}): {}", 
                        attempt, maxRetries, modelToUse, e.getMessage());
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new GeminiServiceException("AI communication interrupted", ie);
                    }
                    continue;
                }
                log.error("Unexpected error calling Gemini API after retries", e);
                throw new GeminiServiceException("Failed to communicate with AI service", e);
            }
        }
        
        throw new GeminiServiceException("Failed to communicate with AI service after retries");
    }
}
