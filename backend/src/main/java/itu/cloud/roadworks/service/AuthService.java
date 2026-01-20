package itu.cloud.roadworks.service;

import itu.cloud.roadworks.dto.*;
import itu.cloud.roadworks.model.Account;
import itu.cloud.roadworks.model.Config;
import itu.cloud.roadworks.model.Role;
import itu.cloud.roadworks.model.Session;
import itu.cloud.roadworks.repository.AccountRepository;
import itu.cloud.roadworks.repository.ConfigRepository;
import itu.cloud.roadworks.repository.RoleRepository;
import itu.cloud.roadworks.repository.SessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AccountRepository accountRepository;
    private final SessionRepository sessionRepository;
    private final ConfigRepository configRepository;
    private final RoleRepository roleRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    // ════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════════

    private Config getConfig() {
        return configRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    // Configuration par défaut : 3 tentatives, session de 24h
                    Config defaultConfig = Config.builder()
                            .maxAttempts(3)
                            .sessionDuration(24)
                            .build();
                    return configRepository.save(defaultConfig);
                });
    }

    // ════════════════════════════════════════════════════════════════════════════
    // LOGIN
    // ════════════════════════════════════════════════════════════════════════════

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        // Rechercher le compte
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Identifiants invalides"));

        // Vérifications du compte
        validateAccountStatus(account);

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getPassword(), account.getPwd())) {
            handleFailedLogin(account);
            throw new AuthException("Identifiants invalides");
        }

        // Réinitialiser les tentatives et mettre à jour la dernière connexion
        account.setAttempts(0);
        account.setLastLogin(Instant.now());
        account.setLastFailedLogin(null);
        accountRepository.save(account);

        // Créer une session
        Session session = createSession(account, httpRequest);

        log.info("Connexion réussie pour: {}", account.getUsername());

        return LoginResponse.builder()
                .token(session.getToken())
                .expiresAt(session.getExpiresAt())
                .account(toAccountResponse(account))
                .build();
    }

    private void validateAccountStatus(Account account) {
        if (!account.getIsActive()) {
            throw new AuthException("Ce compte est désactivé");
        }

        if (account.getIsLocked()) {
            throw new AuthException(
                    "Ce compte est bloqué suite à trop de tentatives échouées. Contactez un administrateur.");
        }
    }

    private void handleFailedLogin(Account account) {
        Config config = getConfig();
        int newAttempts = account.getAttempts() + 1;
        account.setAttempts(newAttempts);
        account.setLastFailedLogin(Instant.now());

        if (newAttempts >= config.getMaxAttempts()) {
            account.setIsLocked(true);
            log.warn("Compte {} bloqué après {} tentatives échouées", account.getUsername(), newAttempts);
        }

        accountRepository.save(account);
    }

    private Session createSession(Account account, HttpServletRequest httpRequest) {
        Config config = getConfig();

        // Générer un token sécurisé
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Calculer l'expiration
        Instant expiresAt = Instant.now().plus(config.getSessionDuration(), ChronoUnit.HOURS);

        Session session = Session.builder()
                .account(account)
                .token(token)
                .createdAt(Instant.now())
                .expiresAt(expiresAt)
                .ipAddress(getClientIp(httpRequest))
                .userAgent(httpRequest.getHeader("User-Agent"))
                .build();

        return sessionRepository.save(session);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // CRÉATION DE COMPTE
    // ════════════════════════════════════════════════════════════════════════════

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        // Vérifier si le username existe déjà
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Un compte avec cet email existe déjà");
        }

        // Récupérer le rôle
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AuthException("Rôle invalide"));

        // Créer le compte
        Account account = Account.builder()
                .username(request.getUsername())
                .pwd(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .firebaseUid(null) // Sera synchronisé plus tard
                .build();

        account = accountRepository.save(account);

        log.info("Compte créé: {} (non synchronisé avec Firebase)", account.getUsername());

        return toAccountResponse(account);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // GESTION DES COMPTES
    // ════════════════════════════════════════════════════════════════════════════

    @Transactional
    public AccountResponse unlockAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AuthException("Compte non trouvé"));

        account.setIsLocked(false);
        account.setAttempts(0);
        account.setLastFailedLogin(null);
        accountRepository.save(account);

        log.info("Compte {} débloqué", account.getUsername());

        return toAccountResponse(account);
    }

    public List<AccountResponse> getLockedAccounts() {
        return accountRepository.findByIsLockedTrue().stream()
                .map(this::toAccountResponse)
                .toList();
    }

    public List<AccountResponse> getUnsyncedAccounts() {
        return accountRepository.findByFirebaseUidIsNull().stream()
                .map(this::toAccountResponse)
                .toList();
    }

    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AuthException("Compte non trouvé"));
        return toAccountResponse(account);
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toAccountResponse)
                .toList();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // VALIDATION DE SESSION
    // ════════════════════════════════════════════════════════════════════════════

    public boolean validateToken(String token) {
        return sessionRepository.existsByTokenAndExpiresAtAfter(token, Instant.now());
    }

    public AccountResponse getAccountFromToken(String token) {
        Session session = sessionRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("Session invalide"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new AuthException("Session expirée");
        }

        return toAccountResponse(session.getAccount());
    }

    @Transactional
    public void logout(String token) {
        sessionRepository.findByToken(token).ifPresent(sessionRepository::delete);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // MAPPERS
    // ════════════════════════════════════════════════════════════════════════════

    private AccountResponse toAccountResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .role(account.getRole().getLibelle())
                .syncedWithFirebase(account.isSyncedWithFirebase())
                .isActive(account.getIsActive())
                .isLocked(account.getIsLocked())
                .createdAt(account.getCreatedAt())
                .lastLogin(account.getLastLogin())
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // EXCEPTIONS
    // ════════════════════════════════════════════════════════════════════════════

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
