package com.playmotech.ghostcoach.model.entity;

import com.playmotech.ghostcoach.model.enums.ConfidenceLevel;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @Column(name = "image_filename", nullable = false, length = 255)
    private String imageFilename;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Type(JsonType.class)
    @Column(name = "strengths", nullable = false, columnDefinition = "jsonb")
    private List<String> strengths;

    @Type(JsonType.class)
    @Column(name = "areas_to_improve", nullable = false, columnDefinition = "jsonb")
    private List<Map<String, String>> areasToImprove;

    @Column(name = "priority_fix", nullable = false, columnDefinition = "TEXT")
    private String priorityFix;

    @Column(name = "drill_suggestion", nullable = false, columnDefinition = "TEXT")
    private String drillSuggestion;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level", nullable = false, length = 10)
    private ConfidenceLevel confidenceLevel;

    @Type(JsonType.class)
    @Column(name = "body_annotations", columnDefinition = "jsonb")
    private List<Map<String, String>> bodyAnnotations;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;
}
