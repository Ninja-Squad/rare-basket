package fr.inra.urgi.rarebasket.dao;

import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * DAO for the {@link AccessionHolder} entity
 * @author JB Nizet
 */
public interface AccessionHolderDao extends JpaRepository<AccessionHolder, Long> {
    Optional<AccessionHolder> findByEmail(String email);
}
