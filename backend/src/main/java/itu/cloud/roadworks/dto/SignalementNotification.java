package itu.cloud.roadworks.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalementNotification {
    private String type; // NEW_SIGNALEMENT, STATUS_UPDATED, WORK_ADDED
    private Long signalementId;
    private String typeProblem;
    private String location;
    private String description;
    private String status;
    private Instant timestamp;
    private String message;
}
