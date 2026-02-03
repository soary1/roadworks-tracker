package itu.cloud.roadworks.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseService {

    private final FirebaseAuth firebaseAuth;

    /**
     * Crée un utilisateur dans Firebase
     * @param email L'email de l'utilisateur
     * @param password Le mot de passe en clair
     * @param displayName Le nom d'affichage (optionnel)
     * @return Le UID Firebase créé
     */
    public String createFirebaseUser(String email, String password, String displayName) {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password);
            
            if (displayName != null && !displayName.isEmpty()) {
                request.setDisplayName(displayName);
            }

            UserRecord userRecord = firebaseAuth.createUser(request);
            log.info("Utilisateur Firebase créé avec succès. UID: {}, Email: {}", userRecord.getUid(), email);
            return userRecord.getUid();
            
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la création de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de créer l'utilisateur dans Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Supprime un utilisateur de Firebase
     * @param firebaseUid Le UID Firebase de l'utilisateur
     */
    public void deleteFirebaseUser(String firebaseUid) {
        try {
            firebaseAuth.deleteUser(firebaseUid);
            log.info("Utilisateur Firebase supprimé avec succès. UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la suppression de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de supprimer l'utilisateur de Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Récupère les informations d'un utilisateur Firebase
     * @param firebaseUid Le UID Firebase
     * @return Les informations de l'utilisateur
     */
    public UserRecord getFirebaseUser(String firebaseUid) {
        try {
            return firebaseAuth.getUser(firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la récupération de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de récupérer l'utilisateur de Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Désactive un utilisateur Firebase
     * @param firebaseUid Le UID Firebase
     */
    public void disableFirebaseUser(String firebaseUid) {
        try {
            firebaseAuth.updateUser(
                    new UserRecord.UpdateRequest(firebaseUid)
                            .setDisabled(true)
            );
            log.info("Utilisateur Firebase désactivé. UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la désactivation de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de désactiver l'utilisateur Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Active un utilisateur Firebase
     * @param firebaseUid Le UID Firebase
     */
    public void enableFirebaseUser(String firebaseUid) {
        try {
            firebaseAuth.updateUser(
                    new UserRecord.UpdateRequest(firebaseUid)
                            .setDisabled(false)
            );
            log.info("Utilisateur Firebase activé. UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de l'activation de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible d'activer l'utilisateur Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Met à jour le mot de passe d'un utilisateur Firebase
     * @param firebaseUid Le UID Firebase
     * @param newPassword Le nouveau mot de passe
     */
    public void updateFirebaseUserPassword(String firebaseUid, String newPassword) {
        try {
            firebaseAuth.updateUser(
                    new UserRecord.UpdateRequest(firebaseUid)
                            .setPassword(newPassword)
            );
            log.info("Mot de passe mis à jour pour l'utilisateur Firebase. UID: {}", firebaseUid);
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la mise à jour du mot de passe Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de mettre à jour le mot de passe Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Récupère l'instance Firestore
     * @return L'instance Firestore
     */
    public Firestore getFirestore() {
        try {
            log.info("Tentative d'obtenir Firestore client...");
            Firestore firestore = FirestoreClient.getFirestore();
            log.info("Firestore client obtenu avec succès");
            return firestore;
        } catch (IllegalStateException e) {
            log.error("Firebase app not initialized or not available: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("Erreur lors de l'accès à Firestore: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Récupère tous les utilisateurs de Firebase
     * @return Liste des enregistrements d'utilisateurs Firebase
     */
    public java.util.List<UserRecord> getAllFirebaseUsers() {
        try {
            java.util.List<UserRecord> users = new java.util.ArrayList<>();
            com.google.firebase.auth.ListUsersPage page = firebaseAuth.listUsers(null);
            
            while (page != null) {
                for (UserRecord userRecord : page.getValues()) {
                    users.add(userRecord);
                }
                page = page.getNextPage();
            }
            
            log.info("Récupération réussie de {} utilisateurs Firebase", users.size());
            return users;
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la récupération des utilisateurs Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de récupérer les utilisateurs Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Vérifie si un utilisateur existe dans Firebase par email
     * @param email L'email à vérifier
     * @return Le UserRecord si trouvé, null sinon
     */
    public UserRecord getFirebaseUserByEmail(String email) {
        try {
            return firebaseAuth.getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            // L'utilisateur n'existe pas
            return null;
        }
    }

    /**
     * Crée ou met à jour un utilisateur dans Firebase
     * @param email L'email de l'utilisateur
     * @param displayName Le nom d'affichage
     * @param isDisabled Si l'utilisateur doit être désactivé
     * @return Le UID Firebase
     */
    public String createOrUpdateFirebaseUser(String email, String displayName, boolean isDisabled) {
        try {
            // Vérifier si l'utilisateur existe déjà
            UserRecord existingUser = getFirebaseUserByEmail(email);
            
            if (existingUser != null) {
                // Mettre à jour l'utilisateur existant
                UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(existingUser.getUid())
                        .setDisabled(isDisabled);
                
                if (displayName != null && !displayName.isEmpty()) {
                    updateRequest.setDisplayName(displayName);
                }
                
                firebaseAuth.updateUser(updateRequest);
                log.info("Utilisateur Firebase mis à jour. UID: {}, Email: {}", existingUser.getUid(), email);
                return existingUser.getUid();
            } else {
                // Créer un nouvel utilisateur avec un mot de passe temporaire
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(java.util.UUID.randomUUID().toString()) // Mot de passe temporaire
                        .setDisabled(isDisabled);
                
                if (displayName != null && !displayName.isEmpty()) {
                    request.setDisplayName(displayName);
                }

                UserRecord userRecord = firebaseAuth.createUser(request);
                log.info("Utilisateur Firebase créé. UID: {}, Email: {}", userRecord.getUid(), email);
                return userRecord.getUid();
            }
        } catch (FirebaseAuthException e) {
            log.error("Erreur lors de la création/mise à jour de l'utilisateur Firebase: {}", e.getMessage());
            throw new RuntimeException("Impossible de créer/mettre à jour l'utilisateur dans Firebase: " + e.getMessage(), e);
        }
    }
}
