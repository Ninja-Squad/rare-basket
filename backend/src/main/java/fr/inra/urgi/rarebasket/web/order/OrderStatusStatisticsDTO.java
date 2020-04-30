package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.OrderStatus;

/**
 * TODO include class javadoc here
 * @author JB Nizet
 */
public final class OrderStatusStatisticsDTO {
    private final OrderStatus orderStatus;
    private final long orderCount;

    public OrderStatusStatisticsDTO(OrderStatus orderStatus, long orderCount) {
        this.orderStatus = orderStatus;
        this.orderCount = orderCount;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public long getOrderCount() {
        return orderCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderStatusStatisticsDTO)) {
            return false;
        }
        OrderStatusStatisticsDTO that = (OrderStatusStatisticsDTO) o;
        return orderCount == that.orderCount &&
            orderStatus == that.orderStatus;
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderStatus, orderCount);
    }

    @Override
    public String toString() {
        return "OrderStatusStatisticsDTO{" +
            "orderStatus=" + orderStatus +
            ", orderCount=" + orderCount +
            '}';
    }
}
