package fr.inra.urgi.rarebasket.dao;

import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.GrcContact;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * DAO for the {@link GrcContact} entity
 * @author JB Nizet
 */
public interface GrcContactDao extends JpaRepository<GrcContact, Long> {
    Optional<GrcContact> findByEmail(String email);
}
