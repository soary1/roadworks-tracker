package itu.cloud.roadworks.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Requête de connexion")
public class LoginRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Schema(description = "Nom d'utilisateur (email)", example = "manager@roadworks.mg")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Schema(description = "Mot de passe", example = "password123")
    private String password;
}
