package fr.inra.urgi.rarebasket.dao;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.persistence.EntityManager;

import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.web.order.CustomerTypeStatisticsDTO;
import fr.inra.urgi.rarebasket.web.order.OrderStatusStatisticsDTO;

/**
 * Implementation of {@link CustomOrderDao}
 * @author JB Nizet
 */
public class CustomOrderDaoImpl implements CustomOrderDao {
    private final EntityManager entityManager;

    public CustomOrderDaoImpl(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<CustomerTypeStatisticsDTO> findCustomerTypeStatistics(Instant fromInstant,
                                                                      Instant toInstant,
                                                                      Long accessionHolderId) {
        String sql = "select basket.customer_type, count(distinct(item.accession_name, item.accession_identifier))" +
            " from accession_order_item item" +
            " inner join accession_order o on item.order_id = o.id" +
            " inner join basket basket on o.basket_id = basket.id" +
            " where o.status = '" + OrderStatus.FINALIZED.name() + "'" +
            " and o.closing_instant >= :fromInstant" +
            " and o.closing_instant < :toInstant" +
            " and o.accession_holder_id = :accessionHolderId" +
            " group by basket.customer_type";
        List<Object[]> rows = entityManager.createNativeQuery(sql)
                                           .setParameter("fromInstant", fromInstant)
                                           .setParameter("toInstant", toInstant)
                                           .setParameter("accessionHolderId", accessionHolderId)
                                           .getResultList();
        Map<CustomerType, CustomerTypeStatisticsDTO> statsByCustomerType =
            rows.stream()
                .map(row -> new CustomerTypeStatisticsDTO(CustomerType.valueOf((String) row[0]),
                                                          ((Number) row[1]).longValue()))
                .collect(Collectors.toMap(CustomerTypeStatisticsDTO::getCustomerType, Function.identity()));

        return Stream.of(CustomerType.values())
                     .map(customerType -> statsByCustomerType.computeIfAbsent(customerType,
                                                                              type -> new CustomerTypeStatisticsDTO(type,
                                                                                                                    0L)))
                     .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<OrderStatusStatisticsDTO> findOrderStatusStatistics(Instant fromInstant,
                                                                    Instant toInstant,
                                                                    Long accessionHolderId) {
        String sql = "select o.status, count(o.id)" +
            " from accession_order o" +
            " inner join basket basket on o.basket_id = basket.id" +
            " where basket.confirmation_instant >= :fromInstant" +
            " and basket.confirmation_instant < :toInstant" +
            " and o.accession_holder_id = :accessionHolderId" +
            " group by o.status";
        List<Object[]> resultList = entityManager.createNativeQuery(sql)
                                                 .setParameter("fromInstant", fromInstant)
                                                 .setParameter("toInstant", toInstant)
                                                 .setParameter("accessionHolderId", accessionHolderId)
                                                 .getResultList();
        Map<OrderStatus, OrderStatusStatisticsDTO> statsByOrderStatus =
            resultList.stream()
                      .map(row -> new OrderStatusStatisticsDTO(OrderStatus.valueOf((String) row[0]),
                                                               ((Number) row[1]).longValue()))
                      .collect(Collectors.toMap(OrderStatusStatisticsDTO::getOrderStatus, Function.identity()));

        return Stream.of(OrderStatus.values())
            .map(status -> statsByOrderStatus.computeIfAbsent(status, s -> new OrderStatusStatisticsDTO(s, 0L)))
            .collect(Collectors.toList());
    }
}
