package itu.cloud.roadworks.service;

import com.google.cloud.firestore.DocumentChange;
import com.google.cloud.firestore.EventListener;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreException;
import com.google.cloud.firestore.ListenerRegistration;
import com.google.cloud.firestore.QuerySnapshot;
import itu.cloud.roadworks.dto.SignalementNotification;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseListenerService {

    private final FirebaseService firebaseService;
    private final SimpMessagingTemplate messagingTemplate;

    private ListenerRegistration listenerRegistration;

    @PostConstruct
    public void startListening() {
        try {
            Firestore db = firebaseService.getFirestore();
            if (db == null) {
                log.warn("Firestore non disponible, le listener ne sera pas démarré");
                return;
            }

            log.info("Démarrage du listener Firebase pour les nouveaux signalements...");

            listenerRegistration = db.collection("roadworks_reports")
                    .addSnapshotListener(new EventListener<QuerySnapshot>() {
                        @Override
                        public void onEvent(QuerySnapshot snapshots, FirestoreException error) {
                            if (error != null) {
                                log.error("Erreur du listener Firebase: {}", error.getMessage());
                                return;
                            }

                            if (snapshots == null) return;

                            for (DocumentChange dc : snapshots.getDocumentChanges()) {
                                if (dc.getType() == DocumentChange.Type.ADDED) {
                                    // Nouveau document ajouté
                                    var doc = dc.getDocument();
                                    String status = doc.getString("status");
                                    Double lat = doc.getDouble("lat");
                                    Double lng = doc.getDouble("lng");
                                    String description = doc.getString("description");

                                    log.info("Nouveau signalement détecté: {} à {},{}", status, lat, lng);

                                    // Envoyer notification WebSocket
                                    SignalementNotification notification = SignalementNotification.builder()
                                            .type("NEW_SIGNALEMENT")
                                            .typeProblem(status)
                                            .location(lat + "," + lng)
                                            .description(description)
                                            .timestamp(Instant.now())
                                            .message("Nouveau signalement: " + getStatusLabel(status))
                                            .build();

                                    messagingTemplate.convertAndSend("/topic/signalements", notification);
                                    log.info("Notification WebSocket envoyée pour nouveau signalement");
                                }
                            }
                        }
                    });

            log.info("Listener Firebase démarré avec succès");
        } catch (Exception e) {
            log.error("Erreur lors du démarrage du listener Firebase: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void stopListening() {
        if (listenerRegistration != null) {
            listenerRegistration.remove();
            log.info("Listener Firebase arrêté");
        }
    }

    private String getStatusLabel(String status) {
        if (status == null) return "Signalement";
        switch (status) {
            case "pothole": return "Nid-de-poule";
            case "blocked_road": return "Route barrée";
            case "accident": return "Accident";
            case "construction": return "Travaux";
            case "flooding": return "Inondation";
            case "debris": return "Débris";
            case "poor_surface": return "Mauvaise surface";
            default: return status;
        }
    }
}
