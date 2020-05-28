package fr.inra.urgi.rarebasket.dao;

import fr.inra.urgi.rarebasket.domain.Grc;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * DAO for the {@link Grc} entity
 */
public interface GrcDao extends JpaRepository<Grc, Long> {

}
