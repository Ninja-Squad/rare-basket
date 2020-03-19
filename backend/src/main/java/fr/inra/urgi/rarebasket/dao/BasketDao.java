package fr.inra.urgi.rarebasket.dao;

import java.util.Optional;

import fr.inra.urgi.rarebasket.domain.Basket;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * DAO for the {@link Basket} entity
 * @author JB Nizet
 */
public interface BasketDao extends JpaRepository<Basket, Long> {
    Optional<Basket> findByReference(String reference);
}
