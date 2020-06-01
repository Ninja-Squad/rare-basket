package fr.inra.urgi.rarebasket.web.order;

import java.util.List;

/**
 * A DTO containing the statistics
 * @author JB Nizet
 */
public final class OrderStatisticsDTO {

    private final long createdOrderCount;
    private final long finalizedOrderCount;
    private final long cancelledOrderCount;
    private final long distinctFinalizedOrderCustomerCount;
    private final double averageFinalizationDurationInDays;

    /**
     * For each order status, the number of orders created during the time frame, over the perimeter,
     * with the given status.
     */
    private final List<OrderStatusStatisticsDTO> orderStatusStatistics;

    /**
     * For each customer type, the number of orders finalized during the time frame, over the perimeter,
     * with a customer of the given type.
     */
    private final List<CustomerTypeStatisticsDTO> customerTypeStatistics;

    public OrderStatisticsDTO(long createdOrderCount,
                              long finalizedOrderCount,
                              long cancelledOrderCount,
                              long distinctFinalizedOrderCustomerCount,
                              double averageFinalizationDurationInDays,
                              List<OrderStatusStatisticsDTO> orderStatusStatistics,
                              List<CustomerTypeStatisticsDTO> customerTypeStatistics) {
        this.createdOrderCount = createdOrderCount;
        this.finalizedOrderCount = finalizedOrderCount;
        this.cancelledOrderCount = cancelledOrderCount;
        this.distinctFinalizedOrderCustomerCount = distinctFinalizedOrderCustomerCount;
        this.averageFinalizationDurationInDays = averageFinalizationDurationInDays;
        this.orderStatusStatistics = orderStatusStatistics;
        this.customerTypeStatistics = customerTypeStatistics;
    }

    public long getCreatedOrderCount() {
        return createdOrderCount;
    }

    public long getFinalizedOrderCount() {
        return finalizedOrderCount;
    }

    public long getCancelledOrderCount() {
        return cancelledOrderCount;
    }

    public long getDistinctFinalizedOrderCustomerCount() {
        return distinctFinalizedOrderCustomerCount;
    }

    public double getAverageFinalizationDurationInDays() {
        return averageFinalizationDurationInDays;
    }

    public List<OrderStatusStatisticsDTO> getOrderStatusStatistics() {
        return orderStatusStatistics;
    }

    public List<CustomerTypeStatisticsDTO> getCustomerTypeStatistics() {
        return customerTypeStatistics;
    }
}
