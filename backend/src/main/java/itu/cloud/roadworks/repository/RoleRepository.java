package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByLibelle(String libelle);
}
