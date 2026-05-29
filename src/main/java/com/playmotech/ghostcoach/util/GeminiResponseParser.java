package com.playmotech.ghostcoach.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.playmotech.ghostcoach.exception.GeminiServiceException;
import com.playmotech.ghostcoach.model.dto.response.FeedbackResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class GeminiResponseParser {

    private final ObjectMapper objectMapper;

    private static final Pattern JSON_FENCE_PATTERN = Pattern.compile(
            "```(?:json)?\\s*\\n?(\\{.*?})\\s*\\n?```",
            Pattern.DOTALL
    );

    public GeminiResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Parses the raw Gemini response text into a FeedbackResponse.
     * Strips markdown code fences if present, then deserializes JSON.
     */
    public FeedbackResponse parseFeedback(String rawResponse) {
        log.debug("Raw Gemini response: {}", rawResponse);

        String jsonString = stripCodeFences(rawResponse.trim());
        log.debug("Cleaned JSON string: {}", jsonString);

        try {
            JsonNode rootNode = objectMapper.readTree(jsonString);
            FeedbackResponse feedback = new FeedbackResponse();

            // Parse overallScore with validation
            int score = rootNode.path("overallScore").asInt(5);
            if (score < 1) score = 1;
            if (score > 10) score = 10;
            feedback.setOverallScore(score);

            // Parse strengths
            List<String> strengths = new ArrayList<>();
            JsonNode strengthsNode = rootNode.path("strengths");
            if (strengthsNode.isArray() && !strengthsNode.isEmpty()) {
                for (JsonNode s : strengthsNode) {
                    strengths.add(s.asText());
                }
            } else {
                throw new GeminiServiceException("AI response missing required 'strengths' array");
            }
            feedback.setStrengths(strengths);

            // Parse areasToImprove
            List<Map<String, String>> areas = new ArrayList<>();
            JsonNode areasNode = rootNode.path("areasToImprove");
            if (areasNode.isArray() && !areasNode.isEmpty()) {
                for (JsonNode area : areasNode) {
                    Map<String, String> areaMap = new HashMap<>();
                    areaMap.put("issue", area.path("issue").asText(""));
                    areaMap.put("explanation", area.path("explanation").asText(""));
                    areas.add(areaMap);
                }
            } else {
                throw new GeminiServiceException("AI response missing required 'areasToImprove' array");
            }
            feedback.setAreasToImprove(areas);

            // Parse priorityFix
            feedback.setPriorityFix(rootNode.path("priorityFix").asText("No priority fix identified"));

            // Parse drillSuggestion
            feedback.setDrillSuggestion(rootNode.path("drillSuggestion").asText("No drill suggested"));

            // Parse confidenceLevel
            String confidence = rootNode.path("confidenceLevel").asText("MEDIUM").toUpperCase();
            if (!confidence.equals("LOW") && !confidence.equals("MEDIUM") && !confidence.equals("HIGH")) {
                confidence = "MEDIUM";
            }
            feedback.setConfidenceLevel(confidence);

            // Parse bodyAnnotations
            List<Map<String, String>> annotations = new ArrayList<>();
            JsonNode annotationsNode = rootNode.path("bodyAnnotations");
            if (annotationsNode.isArray()) {
                for (JsonNode ann : annotationsNode) {
                    Map<String, String> annMap = new HashMap<>();
                    annMap.put("label", ann.path("label").asText(""));
                    annMap.put("description", ann.path("description").asText(""));
                    annMap.put("importance", ann.path("importance").asText("MEDIUM"));
                    annMap.put("x", ann.path("x").asText(""));
                    annMap.put("y", ann.path("y").asText(""));
                    annotations.add(annMap);
                }
            }
            feedback.setBodyAnnotations(annotations);

            log.info("Successfully parsed Gemini feedback: score={}, confidence={}, strengths={}, areas={}",
                    feedback.getOverallScore(), feedback.getConfidenceLevel(),
                    feedback.getStrengths().size(), feedback.getAreasToImprove().size());

            return feedback;

        } catch (GeminiServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini response. Raw: {}", rawResponse, e);
            throw new GeminiServiceException(
                    "Failed to parse AI analysis response. The AI returned an unexpected format.", e);
        }
    }

    /**
     * Strips markdown ```json ... ``` code fences from the response.
     * Gemini occasionally wraps JSON in markdown code blocks.
     */
    public String stripCodeFences(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        String trimmed = text.trim();
        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            log.debug("Extracted JSON substring between braces from Gemini response");
            return trimmed.substring(firstBrace, lastBrace + 1).trim();
        }

        Matcher matcher = JSON_FENCE_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            log.debug("Stripped markdown code fences from Gemini response");
            return matcher.group(1).trim();
        }

        // Also handle case where text starts with ``` but without json tag
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                return trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }

        return trimmed;
    }
}
