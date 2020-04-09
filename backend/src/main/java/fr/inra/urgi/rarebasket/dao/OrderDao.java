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
        value = "select distinct o from Order o" +
            " left join fetch o.basket b" +
            " left join fetch o.items" +
            " where o.accessionHolder.id = ?1" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o where o.accessionHolder.id = ?1")
    Page<Order> pageByAccessionHolder(Long accessionHolderid, Pageable page);

    @Query(
        value = "select o from Order o" +
            " left join fetch o.basket b" +
            " left join fetch o.items" +
            " where o.accessionHolder.id = ?1" +
            " and o.status in ?2" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o" +
            " where o.accessionHolder.id = ?1" +
            " and o.status in ?2")
    Page<Order> pageByAccessionHolderAndStatuses(Long accessionHolderId, Set<OrderStatus> statuses, Pageable page);
}
