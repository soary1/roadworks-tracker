package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.SignalementWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SignalementWorkRepository extends JpaRepository<SignalementWork, Long> {
    @Query("SELECT sw FROM SignalementWork sw WHERE sw.signalement.id = :signalementId")
    List<SignalementWork> findBySignalementId(@Param("signalementId") Long signalementId);
}
