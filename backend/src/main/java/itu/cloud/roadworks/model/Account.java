package itu.cloud.roadworks.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "account")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String pwd;

    @Column(name = "firebase_uid", length = 128, unique = true)
    private String firebaseUid;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_role", nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked;

    @Column(nullable = false)
    private Integer attempts;

    @Column(name = "last_failed_login")
    private Instant lastFailedLogin;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = Instant.now();
        if (isActive == null)
            isActive = true;
        if (isLocked == null)
            isLocked = false;
        if (attempts == null)
            attempts = 0;
    }

    public boolean isSyncedWithFirebase() {
        return firebaseUid != null;
    }
}
