package itu.cloud.roadworks.service;

import itu.cloud.roadworks.model.SecurityLog;
import itu.cloud.roadworks.repository.SecurityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityLogService {

    private final SecurityLogRepository repository;

    public static final String ACTION_VIEW_ALL_SIGNALEMENTS = "VIEW_ALL_SIGNALEMENTS";
    public static final String ACTION_VIEW_SIGNALEMENT = "VIEW_SIGNALEMENT";
    public static final String ACTION_UPDATE_STATUS = "UPDATE_STATUS";
    public static final String ACTION_ADD_WORK = "ADD_WORK";
    public static final String ACTION_SYNC_FIREBASE = "SYNC_FIREBASE";
    public static final String ACTION_SYNC_TO_FIREBASE = "SYNC_TO_FIREBASE";

    public static final String RESOURCE_SIGNALEMENT = "signalement";

    @Transactional
    public void logAccess(String action, String resourceType, Long resourceId,
                          Long userId, String username, String ipAddress, String userAgent) {
        try {
            SecurityLog logEntry = SecurityLog.builder()
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .userId(userId)
                    .username(username)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            repository.save(logEntry);
            log.info("Security log saved: {} - {} - {}", action, resourceType, resourceId);
        } catch (Exception e) {
            log.error("Failed to save security log: {}", e.getMessage(), e);
        }
    }

    public void logViewAllSignalements(Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_VIEW_ALL_SIGNALEMENTS, RESOURCE_SIGNALEMENT, null, userId, username, ipAddress, userAgent);
    }

    public void logViewSignalement(Long signalementId, Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_VIEW_SIGNALEMENT, RESOURCE_SIGNALEMENT, signalementId, userId, username, ipAddress, userAgent);
    }

    public void logUpdateStatus(Long signalementId, Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_UPDATE_STATUS, RESOURCE_SIGNALEMENT, signalementId, userId, username, ipAddress, userAgent);
    }

    public void logAddWork(Long signalementId, Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_ADD_WORK, RESOURCE_SIGNALEMENT, signalementId, userId, username, ipAddress, userAgent);
    }

    public void logSyncFirebase(Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_SYNC_FIREBASE, RESOURCE_SIGNALEMENT, null, userId, username, ipAddress, userAgent);
    }

    public void logSyncToFirebase(Long signalementId, Long userId, String username, String ipAddress, String userAgent) {
        logAccess(ACTION_SYNC_TO_FIREBASE, RESOURCE_SIGNALEMENT, signalementId, userId, username, ipAddress, userAgent);
    }
}
