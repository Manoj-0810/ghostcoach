package com.playmotech.ghostcoach.service;

import com.playmotech.ghostcoach.model.dto.request.LoginRequest;
import com.playmotech.ghostcoach.model.dto.request.RegisterRequest;
import com.playmotech.ghostcoach.model.dto.response.AuthResponse;
import com.playmotech.ghostcoach.model.entity.User;
import com.playmotech.ghostcoach.model.enums.ExperienceLevel;
import com.playmotech.ghostcoach.model.enums.Sport;
import com.playmotech.ghostcoach.repository.UserRepository;
import com.playmotech.ghostcoach.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        Sport sport;
        try {
            sport = Sport.valueOf(request.getSport().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid sport. Allowed: CRICKET, FOOTBALL, BASKETBALL, BADMINTON");
        }

        ExperienceLevel level;
        try {
            level = ExperienceLevel.valueOf(request.getExperienceLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid experience level. Allowed: BEGINNER, INTERMEDIATE, ADVANCED");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .sport(sport)
                .positionRole(request.getPositionRole())
                .experienceLevel(level)
                .age(request.getAge())
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {} ({})", user.getEmail(), user.getId());

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapUserToResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        log.info("User logged in successfully: {} ({})", user.getEmail(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .user(mapUserToResponse(user))
                .build();
    }

    private AuthResponse.UserResponse mapUserToResponse(User user) {
        return AuthResponse.UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .sport(user.getSport().name())
                .positionRole(user.getPositionRole())
                .experienceLevel(user.getExperienceLevel().name())
                .age(user.getAge())
                .build();
    }
}
