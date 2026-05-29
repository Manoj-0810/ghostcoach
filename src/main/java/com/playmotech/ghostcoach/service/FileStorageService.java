package com.playmotech.ghostcoach.service;

import com.playmotech.ghostcoach.exception.InvalidFileException;
import com.playmotech.ghostcoach.util.FileValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path uploadPath;
    private final FileValidator fileValidator;

    public FileStorageService(
            @Value("${app.file.upload-dir}") String uploadDir,
            FileValidator fileValidator) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileValidator = fileValidator;
        initializeStorage();
    }

    private void initializeStorage() {
        try {
            Files.createDirectories(uploadPath);
            log.info("File storage initialized at: {}", uploadPath);
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", uploadPath, e);
            throw new InvalidFileException("Could not initialize file storage");
        }
    }

    /**
     * Validates and stores the file with a UUID-based filename.
     *
     * @return array of [storedFilename, relativePath]
     */
    public String[] storeFile(MultipartFile file) {
        fileValidator.validate(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path targetLocation = uploadPath.resolve(storedFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {} -> {} ({}KB)", originalFilename, storedFilename,
                    file.getSize() / 1024);
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new InvalidFileException("Failed to store uploaded file. Please try again.");
        }

        return new String[]{storedFilename, targetLocation.toString()};
    }

    /**
     * Reads file bytes from storage for sending to Gemini API.
     */
    public byte[] readFileBytes(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Failed to read file: {}", filename, e);
            throw new InvalidFileException("Failed to read uploaded file");
        }
    }

    /**
     * Returns the URL path for accessing an uploaded file.
     */
    public String getFileUrl(String filename) {
        return "/uploads/" + filename;
    }

    /**
     * Deletes a file from storage.
     */
    public void deleteFile(String filename) {
        try {
            Path filePath = uploadPath.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            log.info("Successfully deleted file: {}", filename);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filename, e);
        }
    }
}
