package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.CustomerType;

/**
 * DTO containing an element of the customer type statistics
 * @author JB Nizet
 */
public final class CustomerTypeStatisticsDTO {
    private final CustomerType customerType;
    private final long accessionCount;

    public CustomerTypeStatisticsDTO(CustomerType customerType, long accessionCount) {
        this.customerType = customerType;
        this.accessionCount = accessionCount;
    }

    public CustomerType getCustomerType() {
        return customerType;
    }

    public long getAccessionCount() {
        return accessionCount;
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
        return accessionCount == that.accessionCount &&
            customerType == that.customerType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerType, accessionCount);
    }

    @Override
    public String toString() {
        return "CustomerTypeStatistics{" +
            "customerType=" + customerType +
            ", accessionCount=" + accessionCount +
            '}';
    }
}
