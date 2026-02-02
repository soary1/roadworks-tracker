package itu.cloud.roadworks.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "company")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entreprise responsable des travaux de réparation routière")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identifiant unique de l'entreprise", example = "1")
    private Long id;

    @Column(nullable = false, length = 150)
    @Schema(description = "Nom de l'entreprise", example = "TP Madagascar SARL", required = true)
    private String name;

    @Column(nullable = false, unique = true, length = 30)
    @Schema(description = "Numéro SIRET unique de l'entreprise", example = "12345678901234", required = true)
    private String siret;

    @Column(nullable = false, length = 255)
    @Schema(description = "Adresse postale de l'entreprise", example = "Lot IVG 123 Analakely, Antananarivo", required = true)
    private String address;

    @Column(length = 30)
    @Schema(description = "Numéro de téléphone", example = "+261 34 00 000 00")
    private String phone;

    @Column(length = 150)
    @Schema(description = "Adresse email de contact", example = "contact@tp-madagascar.mg")
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Date de création de l'enregistrement", example = "2024-01-15T10:30:00Z")
    private Instant createdAt;
}
