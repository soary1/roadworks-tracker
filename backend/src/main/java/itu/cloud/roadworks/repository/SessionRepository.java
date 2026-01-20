package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.Account;
import itu.cloud.roadworks.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {

    Optional<Session> findByToken(String token);

    @Modifying
    @Query("DELETE FROM Session s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(Instant now);

    void deleteByAccount(Account account);

    boolean existsByTokenAndExpiresAtAfter(String token, Instant now);
}
