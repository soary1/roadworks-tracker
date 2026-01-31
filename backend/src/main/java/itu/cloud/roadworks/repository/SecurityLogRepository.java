package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.SecurityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {
    List<SecurityLog> findByUserId(Long userId);
    List<SecurityLog> findByAction(String action);
    List<SecurityLog> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
}
