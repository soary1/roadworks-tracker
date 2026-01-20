package itu.cloud.roadworks.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Requête de création de compte utilisateur")
public class CreateAccountRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Email(message = "Le format de l'email est invalide")
    @Schema(description = "Nom d'utilisateur (email)", example = "user@example.com")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    @Schema(description = "Mot de passe", example = "securePass123")
    private String password;

    @NotNull(message = "Le rôle est obligatoire")
    @Schema(description = "ID du rôle (1=MANAGER, 2=USER)", example = "2")
    private Long roleId;
}
