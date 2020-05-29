package fr.inra.urgi.rarebasket.dao;

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
    List<CustomerTypeStatisticsDTO> findCustomerTypeStatistics(Instant fromInstant,
                                                               Instant toInstant,
                                                               VisualizationPerimeter perimeter);

    List<OrderStatusStatisticsDTO> findOrderStatusStatistics(Instant fromInstant,
                                                             Instant toInstant,
                                                             VisualizationPerimeter perimeter);
}
