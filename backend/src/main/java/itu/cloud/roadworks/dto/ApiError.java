package itu.cloud.roadworks.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse d'erreur API")
public class ApiError {

    @Schema(description = "Code d'erreur HTTP")
    private int status;

    @Schema(description = "Message d'erreur")
    private String message;

    @Schema(description = "Timestamp de l'erreur")
    private Instant timestamp;

    @Schema(description = "Liste des erreurs de validation")
    private List<String> errors;

    public static ApiError of(int status, String message) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
