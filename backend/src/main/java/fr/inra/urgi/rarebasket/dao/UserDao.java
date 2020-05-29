package fr.inra.urgi.rarebasket.dao;

import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for the {@link User} entity
 * @author JB Nizet
 */
public interface UserDao extends JpaRepository<User, Long> {
    @Query(
        "select distinct u from User u"
        + " left join fetch u.accessionHolder ah"
        + " left join fetch ah.grc"
        + " left join fetch u.permissions"
        + " left join fetch u.visualizationGrcs"
        + " where u.name = :name"
    )
    Optional<User> findByName(@Param("name") String name);

    @Query(
        value = "select distinct u from User u"
            + " left join fetch u.accessionHolder ah"
            + " left join fetch ah.grc"
            + " left join fetch u.permissions"
            + " order by u.name",
        countQuery = "select count(u.id) from User u")
    Page<User> pageAll(Pageable page);
}
