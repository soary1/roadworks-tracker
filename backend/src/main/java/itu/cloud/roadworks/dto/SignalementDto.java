package itu.cloud.roadworks.dto;

import itu.cloud.roadworks.model.Signalement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementDto {
    private Long id;
    private Long accountId;
    private String accountUsername;
    private String descriptions;
    private Instant createdAt;
    private String location;
    private String picture;
    private BigDecimal surface;
    private Long typeProblemId;
    private String typeProblemLibelle;

    public static SignalementDto fromEntity(Signalement entity) {
        return SignalementDto.builder()
                .id(entity.getId())
                .accountId(entity.getAccount() != null ? entity.getAccount().getId() : null)
                .accountUsername(entity.getAccount() != null ? entity.getAccount().getUsername() : null)
                .descriptions(entity.getDescriptions())
                .createdAt(entity.getCreatedAt())
                .location(entity.getLocation())
                .picture(entity.getPicture())
                .surface(entity.getSurface())
                .typeProblemId(entity.getTypeProblem() != null ? entity.getTypeProblem().getId() : null)
                .typeProblemLibelle(entity.getTypeProblem() != null ? entity.getTypeProblem().getLibelle() : null)
                .build();
    }
}
