package fr.inra.urgi.rarebasket.web.order;

import java.util.List;

/**
 * A DTO containing the statistics
 * @author JB Nizet
 */
public final class OrderStatisticsDTO {

    private final List<OrderStatusStatisticsDTO> orderStatusStatistics;
    private final List<CustomerTypeStatisticsDTO> customerTypeStatistics;

    public OrderStatisticsDTO(List<OrderStatusStatisticsDTO> orderStatusStatistics,
                              List<CustomerTypeStatisticsDTO> customerTypeStatistics) {
        this.orderStatusStatistics = orderStatusStatistics;
        this.customerTypeStatistics = customerTypeStatistics;
    }

    public List<OrderStatusStatisticsDTO> getOrderStatusStatistics() {
        return orderStatusStatistics;
    }

    public List<CustomerTypeStatisticsDTO> getCustomerTypeStatistics() {
        return customerTypeStatistics;
    }


}
