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
@Schema(description = "Informations du compte utilisateur")
public class AccountResponse {

    @Schema(description = "ID du compte")
    private Long id;

    @Schema(description = "Nom d'utilisateur (email)")
    private String username;

    @Schema(description = "Rôle de l'utilisateur")
    private String role;

    @Schema(description = "Synchronisé avec Firebase")
    private Boolean syncedWithFirebase;

    @Schema(description = "Compte actif")
    private Boolean isActive;

    @Schema(description = "Compte bloqué")
    private Boolean isLocked;

    @Schema(description = "Date de création")
    private Instant createdAt;

    @Schema(description = "Dernière connexion")
    private Instant lastLogin;
}
