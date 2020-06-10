package fr.inra.urgi.rarebasket.dao;

import java.util.List;
import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.Grc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * DAO for the {@link Grc} entity
 */
public interface GrcDao extends JpaRepository<Grc, Long> {

    @Query("select grc from Grc grc order by grc.name")
    List<Grc> list();

    Optional<Grc> findByName(String name);
}
