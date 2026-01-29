package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.TypeProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TypeProblemRepository extends JpaRepository<TypeProblem, Long> {
    Optional<TypeProblem> findByLibelle(String libelle);
}
