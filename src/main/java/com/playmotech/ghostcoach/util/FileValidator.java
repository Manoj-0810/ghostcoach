package com.playmotech.ghostcoach.util;

import com.playmotech.ghostcoach.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Slf4j
@Component
public class FileValidator {

    private final long maxSizeBytes;
    private final List<String> allowedMimeTypes;
    private final Tika tika;

    public FileValidator(
            @Value("${app.file.max-size-bytes}") long maxSizeBytes,
            @Value("${app.file.allowed-mime-types}") List<String> allowedMimeTypes) {
        this.maxSizeBytes = maxSizeBytes;
        this.allowedMimeTypes = allowedMimeTypes;
        this.tika = new Tika();
        log.info("FileValidator initialized: maxSize={}MB, allowedTypes={}",
                maxSizeBytes / (1024 * 1024), allowedMimeTypes);
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is required and must not be empty");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException(String.format(
                    "File size %dKB exceeds maximum allowed size of %dMB",
                    file.getSize() / 1024, maxSizeBytes / (1024 * 1024)));
        }

        String detectedMimeType = detectMimeType(file);
        log.debug("Detected MIME type: {} for file: {}", detectedMimeType, file.getOriginalFilename());

        if (!allowedMimeTypes.contains(detectedMimeType)) {
            throw new InvalidFileException(String.format(
                    "File type '%s' is not allowed. Accepted types: %s",
                    detectedMimeType, String.join(", ", allowedMimeTypes)));
        }
    }

    private String detectMimeType(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return tika.detect(inputStream, file.getOriginalFilename());
        } catch (IOException e) {
            log.error("Failed to detect MIME type for file: {}", file.getOriginalFilename(), e);
            throw new InvalidFileException("Could not determine file type. Please try a different file.");
        }
    }

    public String getExtensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".bin";
        };
    }
}
