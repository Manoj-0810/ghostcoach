package com.playmotech.ghostcoach.repository;

import com.playmotech.ghostcoach.model.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query("SELECT s FROM Session s JOIN FETCH s.user WHERE s.id = :id")
    Optional<Session> findByIdWithUser(@Param("id") UUID id);

    @Query("SELECT s FROM Session s WHERE s.user.id = :userId ORDER BY s.uploadedAt DESC")
    Page<Session> findByUserIdOrderByUploadedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT s FROM Session s WHERE s.user.id = :userId ORDER BY s.uploadedAt ASC")
    List<Session> findByUserIdOrderByUploadedAtAsc(@Param("userId") UUID userId);

    @Query("SELECT s FROM Session s JOIN FETCH s.user WHERE s.id IN :ids AND s.user.id = :userId")
    List<Session> findByIdInAndUserId(@Param("ids") List<UUID> ids, @Param("userId") UUID userId);
}
