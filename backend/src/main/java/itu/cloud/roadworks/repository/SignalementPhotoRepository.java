package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.SignalementPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementPhotoRepository extends JpaRepository<SignalementPhoto, Long> {

    List<SignalementPhoto> findBySignalementIdOrderByPhotoOrderAsc(Long signalementId);

    void deleteBySignalementId(Long signalementId);
}
