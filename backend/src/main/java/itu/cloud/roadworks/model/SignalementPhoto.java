package itu.cloud.roadworks.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "signalement_photo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_signalement", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Signalement signalement;

    @Column(name = "photo_data", columnDefinition = "TEXT", nullable = false)
    private String photoData; // Base64 ou URL de la photo

    @Column(name = "photo_order")
    private Integer photoOrder; // Ordre de la photo (1, 2, 3...)

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
