package fr.inra.urgi.rarebasket.dao;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Stream;

import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * DAO for the {@link Order} entity
 * @author JB Nizet
 */
public interface OrderDao extends JpaRepository<Order, Long>, CustomOrderDao {

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

    /**
     * Generates the rows of the order CSV report.
     * @see fr.inra.urgi.rarebasket.service.order.OrderCsvExporter
     */
    @Query(
        "select basket.reference," +
            " basket.customer.email," +
            " basket.customer.type," +
            " basket.customer.language," +
            " basket.confirmationInstant," +
            " grc.name," +
            " accessionHolder.name," +
            " o.status," +
            " o.closingInstant," +
            " orderItem.accession.name," +
            " orderItem.accession.identifier," +
            " orderItem.quantity," +
            " orderItem.unit" +
            " from OrderItem orderItem" +
            " join orderItem.order o" +
            " join o.basket basket" +
            " join o.accessionHolder accessionHolder" +
            " join accessionHolder.grc grc" +
            " where o.status = fr.inra.urgi.rarebasket.domain.OrderStatus.FINALIZED" +
            " and o.closingInstant >= :fromInstant" +
            " and o.closingInstant < :toInstant" +
            " and accessionHolder.id = :accessionHolderId" +
            " order by o.closingInstant, orderItem.accession.name, orderItem.accession.identifier"
    )
    Stream<Object[]> reportBetween(@Param("fromInstant") Instant fromInstant,
                                   @Param("toInstant") Instant toInstant,
                                   @Param("accessionHolderId") Long accessionHolderId);

}
