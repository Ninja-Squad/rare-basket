package fr.inra.urgi.rarebasket.dao;

import java.time.Instant;
import java.util.List;
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
            " where o.accessionHolder.id in ?1" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o where o.accessionHolder.id in ?1")
    Page<Order> pageByAccessionHolders(Set<Long> accessionHolderIds, Pageable page);

    @Query(
        value = "select o from Order o" +
            " left join fetch o.basket b" +
            " left join fetch o.items" +
            " where o.accessionHolder.id in ?1" +
            " and o.status in ?2" +
            " order by b.confirmationInstant desc",
        countQuery = "select count(o.id) from Order o" +
            " where o.accessionHolder.id in ?1" +
            " and o.status in ?2")
    Page<Order> pageByAccessionHoldersAndStatuses(Set<Long> accessionHolderIds, Set<OrderStatus> statuses, Pageable page);

    /**
     * Generates the rows of the order CSV report for the global perimeter.
     * @see fr.inra.urgi.rarebasket.service.order.OrderCsvExporter
     */
    @Query(ReportQueries.REPORT_QUERY)
    Stream<ReportingOrder> reportBetween(@Param("fromInstant") Instant fromInstant,
                                         @Param("toInstant") Instant toInstant);

    /**
     * Generates the rows of the order CSV report for the given perimeter.
     * @see fr.inra.urgi.rarebasket.service.order.OrderCsvExporter
     */
    @Query(ReportQueries.GRC_REPORT_QUERY)
    Stream<ReportingOrder> reportBetween(@Param("fromInstant") Instant fromInstant,
                                         @Param("toInstant") Instant toInstant,
                                         @Param("grcIds") Set<Long> grcIds);

    @Query(
        "select new fr.inra.urgi.rarebasket.dao.DocumentTypeOnOrder(o.id, document.type)" +
            " from Order o" +
            " join o.documents document" +
            " where o.id in :orderIds" +
            " and document.onDeliveryForm = true"

    )
    List<DocumentTypeOnOrder> findDocumentTypesOnOrders(@Param("orderIds") Set<Long> orderIds);
}

class ReportQueries {
    private static final String BEGINNING = "select new fr.inra.urgi.rarebasket.dao.ReportingOrder(" +
        " o.id," +
        " basket.reference," +
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
        ")" +
        " from Order o" +
        " left join o.items orderItem" +
        " join o.basket basket" +
        " join o.accessionHolder accessionHolder" +
        " join accessionHolder.grc grc" +
        " where o.status <> fr.inra.urgi.rarebasket.domain.OrderStatus.DRAFT" +
        " and o.closingInstant >= :fromInstant" +
        " and o.closingInstant < :toInstant";
    private static final String END =
        " order by o.closingInstant, o.id, orderItem.accession.name, orderItem.accession.identifier";

    static final String REPORT_QUERY = BEGINNING + END;
    static final String GRC_REPORT_QUERY =
        BEGINNING +
            " and grc.id in :grcIds"
            + END;
}
