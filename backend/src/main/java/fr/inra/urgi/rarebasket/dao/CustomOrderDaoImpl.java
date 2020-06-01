package fr.inra.urgi.rarebasket.dao;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
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
                                                                      VisualizationPerimeter perimeter) {
        String jpql =
            "select basket.customer.type, count(o.id)" +
                " from Order o" +
                " inner join o.basket basket";
        if (perimeter.isConstrained()) {
            jpql +=
                " inner join o.accessionHolder accessionHolder" +
                    " inner join accessionHolder.grc grc";
        }
        jpql +=
            " where o.status = fr.inra.urgi.rarebasket.domain.OrderStatus.FINALIZED" +
                " and o.closingInstant >= :fromInstant" +
                " and o.closingInstant < :toInstant";
        if (perimeter.isConstrained()) {
            jpql += " and grc.id in :grcIds";
        }
        jpql += " group by basket.customer.type";
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class)
                                                  .setParameter("fromInstant", fromInstant)
                                                  .setParameter("toInstant", toInstant);
        if (perimeter.isConstrained()) {
            query.setParameter("grcIds", perimeter.getGrcIds());
        }
        List<Object[]> rows = query.getResultList();
        Map<CustomerType, CustomerTypeStatisticsDTO> statsByCustomerType =
            rows.stream()
                .map(row -> new CustomerTypeStatisticsDTO((CustomerType) row[0],
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
                                                                    VisualizationPerimeter perimeter) {
        String jpql =
            "select o.status, count(o.id)" +
                " from Order o" +
                " inner join o.basket basket";
        if (perimeter.isConstrained()) {
            jpql +=
                " inner join o.accessionHolder accessionHolder" +
                    " inner join accessionHolder.grc grc";
        }
        jpql +=
            " where basket.confirmationInstant >= :fromInstant" +
                " and basket.confirmationInstant < :toInstant";
        if (perimeter.isConstrained()) {
            jpql += " and grc.id in :grcIds";
        }
        jpql += " group by o.status";
        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class)
                                                  .setParameter("fromInstant", fromInstant)
                                                  .setParameter("toInstant", toInstant);
        if (perimeter.isConstrained()) {
            query.setParameter("grcIds", perimeter.getGrcIds());
        }
        List<Object[]> resultList = query.getResultList();
        Map<OrderStatus, OrderStatusStatisticsDTO> statsByOrderStatus =
            resultList.stream()
                      .map(row -> new OrderStatusStatisticsDTO((OrderStatus) row[0],
                                                               ((Number) row[1]).longValue()))
                      .collect(Collectors.toMap(OrderStatusStatisticsDTO::getOrderStatus, Function.identity()));

        return Stream.of(OrderStatus.values())
                     .map(status -> statsByOrderStatus.computeIfAbsent(status,
                                                                       s -> new OrderStatusStatisticsDTO(s, 0L)))
                     .collect(Collectors.toList());
    }

    @Override
    public long countCancelledOrders(Instant fromInstant, Instant toInstant, VisualizationPerimeter perimeter) {
        String jpql =
            "select count(o.id)" +
                " from Order o";
        if (perimeter.isConstrained()) {
            jpql +=
                " inner join o.accessionHolder accessionHolder" +
                    " inner join accessionHolder.grc grc";
        }
        jpql +=
            " where o.status = fr.inra.urgi.rarebasket.domain.OrderStatus.CANCELLED" +
                " and o.closingInstant >= :fromInstant" +
                " and o.closingInstant < :toInstant";
        if (perimeter.isConstrained()) {
            jpql += " and grc.id in :grcIds";
        };
        TypedQuery<Number> query = entityManager.createQuery(jpql, Number.class)
                                                .setParameter("fromInstant", fromInstant)
                                                .setParameter("toInstant", toInstant);
        if (perimeter.isConstrained()) {
            query.setParameter("grcIds", perimeter.getGrcIds());
        }
        Number count = query.getSingleResult();
        return count.longValue();
    }

    @Override
    public long countDistinctCustomersOfFinalizedOrders(Instant fromInstant,
                                                        Instant toInstant,
                                                        VisualizationPerimeter perimeter) {
        String jpql =
            "select count(distinct basket.customer.email)" +
                " from Order o" +
                " inner join o.basket basket";
        if (perimeter.isConstrained()) {
            jpql +=
                " inner join o.accessionHolder accessionHolder" +
                    " inner join accessionHolder.grc grc";
        }
        jpql +=
            " where o.status = fr.inra.urgi.rarebasket.domain.OrderStatus.FINALIZED" +
                " and o.closingInstant >= :fromInstant" +
                " and o.closingInstant < :toInstant";
        if (perimeter.isConstrained()) {
            jpql += " and grc.id in :grcIds";
        };
        TypedQuery<Number> query = entityManager.createQuery(jpql, Number.class)
                                                .setParameter("fromInstant", fromInstant)
                                                .setParameter("toInstant", toInstant);
        if (perimeter.isConstrained()) {
            query.setParameter("grcIds", perimeter.getGrcIds());
        }
        Number count = query.getSingleResult();
        return count.longValue();
    }

    @Override
    public Duration computeAverageFinalizationDuration(Instant fromInstant,
                                                       Instant toInstant,
                                                       VisualizationPerimeter perimeter) {
        String jpql =
            "select avg(EXTRACT(EPOCH FROM o.closingInstant) - EXTRACT(EPOCH from basket.confirmationInstant))" +
                " from Order o" +
                " inner join o.basket basket";
        if (perimeter.isConstrained()) {
            jpql +=
                " inner join o.accessionHolder accessionHolder" +
                    " inner join accessionHolder.grc grc";
        }
        jpql +=
            " where o.status = fr.inra.urgi.rarebasket.domain.OrderStatus.FINALIZED" +
                " and o.closingInstant >= :fromInstant" +
                " and o.closingInstant < :toInstant";
        if (perimeter.isConstrained()) {
            jpql += " and grc.id in :grcIds";
        };
        TypedQuery<Number> query = entityManager.createQuery(jpql, Number.class)
                                                .setParameter("fromInstant", fromInstant)
                                                .setParameter("toInstant", toInstant);
        if (perimeter.isConstrained()) {
            query.setParameter("grcIds", perimeter.getGrcIds());
        }
        Number seconds = query.getSingleResult();
        return Duration.ofSeconds(seconds == null ? 0L : seconds.longValue());
    }
}
