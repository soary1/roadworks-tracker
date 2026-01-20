package itu.cloud.roadworks.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Réponse de connexion réussie")
public class LoginResponse {

    @Schema(description = "Token de session")
    private String token;

    @Schema(description = "Date d'expiration du token")
    private Instant expiresAt;

    @Schema(description = "Informations de l'utilisateur")
    private AccountResponse account;
}
