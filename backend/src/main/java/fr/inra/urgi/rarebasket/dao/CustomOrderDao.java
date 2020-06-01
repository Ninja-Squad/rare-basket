package fr.inra.urgi.rarebasket.dao;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import fr.inra.urgi.rarebasket.service.user.VisualizationPerimeter;
import fr.inra.urgi.rarebasket.web.order.CustomerTypeStatisticsDTO;
import fr.inra.urgi.rarebasket.web.order.OrderStatusStatisticsDTO;

/**
 * Custom methods for {@link OrderDao}
 * @author JB Nizet
 */
public interface CustomOrderDao {

    /**
     * For each order status, finds the number of orders created during the given time frame, over the given perimeter.
     */
    List<CustomerTypeStatisticsDTO> findCustomerTypeStatistics(Instant fromInstant,
                                                               Instant toInstant,
                                                               VisualizationPerimeter perimeter);

    /**
     * For each customer type, finds the number of orders finalized during the given time frame, over the given perimeter.
     */
    List<OrderStatusStatisticsDTO> findOrderStatusStatistics(Instant fromInstant,
                                                             Instant toInstant,
                                                             VisualizationPerimeter perimeter);

    /**
     * Counts the orders cancelled during the given time frame, over the given perimeter.
     */
    long countCancelledOrders(Instant fromInstant,
                              Instant toInstant,
                              VisualizationPerimeter perimeter);

    /**
     * Counts the number of distinct customer email addresses for finalized orders during the given time frame,
     * over the perimeter
     */
    long countDistinctCustomersOfFinalizedOrders(Instant fromInstant,
                                                 Instant toInstant,
                                                 VisualizationPerimeter perimeter);

    /**
     * Computes the average time needed to finalize an order for finalized orders during the given time frame,
     * over the perimeter
     */
    Duration computeAverageFinalizationDuration(Instant fromInstant,
                                                Instant toInstant,
                                                VisualizationPerimeter perimeter);
}
