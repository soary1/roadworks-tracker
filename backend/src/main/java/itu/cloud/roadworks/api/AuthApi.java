package itu.cloud.roadworks.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import itu.cloud.roadworks.dto.*;
import itu.cloud.roadworks.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "API d'authentification et gestion des comptes")
public class AuthApi {

    private final AuthService authService;

    // ════════════════════════════════════════════════════════════════════════════
    // LOGIN / LOGOUT
    // ════════════════════════════════════════════════════════════════════════════

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur", description = "Authentifie un utilisateur et retourne un token de session")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion réussie", content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Identifiants invalides ou compte bloqué", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        LoginResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion", description = "Invalide le token de session actuel")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Déconnexion réussie")
    })
    public ResponseEntity<Void> logout(
            @Parameter(description = "Token de session", required = true) @RequestHeader("Authorization") String authHeader) {

        String token = extractToken(authHeader);
        authService.logout(token);
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // GESTION DES COMPTES
    // ════════════════════════════════════════════════════════════════════════════

    @PostMapping("/accounts")
    @Operation(summary = "Créer un compte utilisateur", description = "Crée un nouveau compte. Le compte n'est pas synchronisé avec Firebase tant qu'une synchronisation n'est pas effectuée.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Compte créé avec succès", content = @Content(schema = @Schema(implementation = AccountResponse.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides ou email déjà utilisé", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {

        AccountResponse response = authService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/accounts")
    @Operation(summary = "Lister tous les comptes", description = "Récupère la liste de tous les comptes utilisateurs")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(authService.getAllAccounts());
    }

    @GetMapping("/accounts/{id}")
    @Operation(summary = "Récupérer un compte par ID", description = "Récupère les détails d'un compte spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Compte trouvé", content = @Content(schema = @Schema(implementation = AccountResponse.class))),
            @ApiResponse(responseCode = "404", description = "Compte non trouvé", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<AccountResponse> getAccount(
            @Parameter(description = "ID du compte") @PathVariable Long id) {

        return ResponseEntity.ok(authService.getAccountById(id));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // DÉBLOCAGE DES COMPTES
    // ════════════════════════════════════════════════════════════════════════════

    @GetMapping("/accounts/locked")
    @Operation(summary = "Lister les comptes bloqués", description = "Récupère la liste des comptes bloqués suite à trop de tentatives de connexion")
    public ResponseEntity<List<AccountResponse>> getLockedAccounts() {
        return ResponseEntity.ok(authService.getLockedAccounts());
    }

    @PostMapping("/accounts/{id}/unlock")
    @Operation(summary = "Débloquer un compte", description = "Réinitialise le blocage et le compteur de tentatives d'un compte")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Compte débloqué", content = @Content(schema = @Schema(implementation = AccountResponse.class))),
            @ApiResponse(responseCode = "404", description = "Compte non trouvé", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<AccountResponse> unlockAccount(
            @Parameter(description = "ID du compte à débloquer") @PathVariable Long id) {

        return ResponseEntity.ok(authService.unlockAccount(id));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // SYNCHRONISATION FIREBASE
    // ════════════════════════════════════════════════════════════════════════════

    @GetMapping("/accounts/unsynced")
    @Operation(summary = "Lister les comptes non synchronisés", description = "Récupère la liste des comptes qui n'ont pas encore été synchronisés avec Firebase")
    public ResponseEntity<List<AccountResponse>> getUnsyncedAccounts() {
        return ResponseEntity.ok(authService.getUnsyncedAccounts());
    }

    // ════════════════════════════════════════════════════════════════════════════
    // VALIDATION DE SESSION
    // ════════════════════════════════════════════════════════════════════════════

    @GetMapping("/me")
    @Operation(summary = "Récupérer l'utilisateur courant", description = "Récupère les informations du compte associé au token de session")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé", content = @Content(schema = @Schema(implementation = AccountResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token invalide ou expiré", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<AccountResponse> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {

        String token = extractToken(authHeader);
        return ResponseEntity.ok(authService.getAccountFromToken(token));
    }

    @GetMapping("/validate")
    @Operation(summary = "Valider un token", description = "Vérifie si un token de session est valide et non expiré")
    public ResponseEntity<Boolean> validateToken(
            @RequestHeader("Authorization") String authHeader) {

        String token = extractToken(authHeader);
        return ResponseEntity.ok(authService.validateToken(token));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════════════════

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}
