package fr.inra.urgi.rarebasket.service.event;

import java.util.Objects;

/**
 * Event published when for each order created when a basked is confirmed.
 * @author JB Nizet
 */
public final class OrderCreated {
    private final Long orderId;

    public OrderCreated(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderCreated)) {
            return false;
        }
        OrderCreated that = (OrderCreated) o;
        return Objects.equals(orderId, that.orderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId);
    }

    @Override
    public String toString() {
        return "OrderCreated{" +
            "orderId=" + orderId +
            '}';
    }
}
