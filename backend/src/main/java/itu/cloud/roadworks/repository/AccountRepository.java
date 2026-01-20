package itu.cloud.roadworks.repository;

import itu.cloud.roadworks.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByFirebaseUid(String firebaseUid);

    boolean existsByUsername(String username);

    List<Account> findByFirebaseUidIsNull();

    List<Account> findByIsLockedTrue();
}
