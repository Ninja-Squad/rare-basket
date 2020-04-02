package fr.inra.urgi.rarebasket.dao;

import java.util.Set;

import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * DAO for the {@link Order} entity
 * @author JB Nizet
 */
public interface OrderDao extends JpaRepository<Order, Long> {

    @Query(
        value = "select o from Order o" +
            " left join fetch o.basket b" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o")
    Page<Order> pageAll(Pageable page);

    @Query(
        value = "select o from Order o" +
            " left join fetch o.basket b" +
            " where o.status in ?1" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o" +
            " where o.status in ?1")
    Page<Order> pageByStatuses(Set<OrderStatus> statuses, Pageable page);
}
