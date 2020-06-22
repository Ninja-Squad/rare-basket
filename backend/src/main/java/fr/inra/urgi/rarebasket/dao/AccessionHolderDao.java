package fr.inra.urgi.rarebasket.dao;

import java.util.List;
import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * DAO for the {@link AccessionHolder} entity
 * @author JB Nizet
 */
public interface AccessionHolderDao extends JpaRepository<AccessionHolder, Long> {
    Optional<AccessionHolder> findByEmail(String email);

    Optional<AccessionHolder> findByName(String name);

    @Query("select ah from AccessionHolder ah left join fetch ah.grc grc order by grc.name, ah.name")
    List<AccessionHolder> list();
}
