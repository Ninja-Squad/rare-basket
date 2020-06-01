package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.CustomerType;

/**
 * DTO containing an element of the customer type statistics
 * @author JB Nizet
 */
public final class CustomerTypeStatisticsDTO {
    private final CustomerType customerType;
    private final long finalizedOrderCount;

    public CustomerTypeStatisticsDTO(CustomerType customerType, long finalizedOrderCount) {
        this.customerType = customerType;
        this.finalizedOrderCount = finalizedOrderCount;
    }

    public CustomerType getCustomerType() {
        return customerType;
    }

    public long getFinalizedOrderCount() {
        return finalizedOrderCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CustomerTypeStatisticsDTO)) {
            return false;
        }
        CustomerTypeStatisticsDTO that = (CustomerTypeStatisticsDTO) o;
        return finalizedOrderCount == that.finalizedOrderCount &&
            customerType == that.customerType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerType, finalizedOrderCount);
    }

    @Override
    public String toString() {
        return "CustomerTypeStatistics{" +
            "customerType=" + customerType +
            ", finalizedOrderCount=" + finalizedOrderCount +
            '}';
    }
}
