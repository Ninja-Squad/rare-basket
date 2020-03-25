package fr.inra.urgi.rarebasket.dao;

import fr.inra.urgi.rarebasket.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * DAO for the {@link Order} entity
 * @author JB Nizet
 */
public interface OrderDao extends JpaRepository<Order, Long> {
}
