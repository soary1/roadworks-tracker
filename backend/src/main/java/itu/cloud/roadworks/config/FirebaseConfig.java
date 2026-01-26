package itu.cloud.roadworks.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.credentials-path:}")
    private String credentialsPath;

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        log.info("=== DEBUT INITIALISATION FIREBASE ===");
        log.info("Firebase credentials path: {}", credentialsPath);
        
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                log.info("FirebaseApp non initialisé, on procède à l'initialisation...");
                GoogleCredentials credentials;
                
                if (credentialsPath != null && !credentialsPath.isEmpty()) {
                    // Charger les credentials depuis le fichier spécifié
                    log.info("Initialisation Firebase avec le fichier: {}", credentialsPath);
                    java.io.File file = new java.io.File(credentialsPath);
                    if (file.exists()) {
                        log.info("Fichier Firebase trouvé: {}", file.getAbsolutePath());
                        credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath));
                        log.info("Credentials chargées depuis le fichier");
                    } else {
                        log.warn("Fichier Firebase NOT FOUND: {}, utilisation des credentials par défaut", credentialsPath);
                        credentials = GoogleCredentials.getApplicationDefault();
                    }
                } else {
                    // Utiliser les credentials par défaut (variables d'environnement, etc.)
                    log.info("Initialisation Firebase avec les credentials par défaut");
                    credentials = GoogleCredentials.getApplicationDefault();
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase App initialisé avec succès ✓");
            } else {
                log.info("Firebase App déjà initialisé");
            }

            FirebaseAuth firebaseAuthInstance = FirebaseAuth.getInstance();
            log.info("FirebaseAuth Bean créé avec succès ✓");
            log.info("=== FIN INITIALISATION FIREBASE ===");
            return firebaseAuthInstance;
        } catch (Exception e) {
            log.error("❌ ERREUR lors de l'initialisation de Firebase: {}", e.getMessage(), e);
            log.error("Stack trace complet:", e);
            throw e;
        }
    }
}
