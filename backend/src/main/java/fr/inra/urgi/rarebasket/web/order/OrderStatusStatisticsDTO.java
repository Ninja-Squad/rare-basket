package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.OrderStatus;

/**
 * DTO containing an element of the order status statistics
 * @author JB Nizet
 */
public final class OrderStatusStatisticsDTO {
    private final OrderStatus orderStatus;
    private final long createdOrderCount;

    public OrderStatusStatisticsDTO(OrderStatus orderStatus, long createdOrderCount) {
        this.orderStatus = orderStatus;
        this.createdOrderCount = createdOrderCount;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public long getCreatedOrderCount() {
        return createdOrderCount;
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
        return createdOrderCount == that.createdOrderCount &&
            orderStatus == that.orderStatus;
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderStatus, createdOrderCount);
    }

    @Override
    public String toString() {
        return "OrderStatusStatisticsDTO{" +
            "orderStatus=" + orderStatus +
            ", createdOrderCount=" + createdOrderCount +
            '}';
    }
}
