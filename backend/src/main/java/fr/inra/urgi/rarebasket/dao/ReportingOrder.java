package fr.inra.urgi.rarebasket.dao;

import java.time.Instant;
import java.util.Objects;

import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;

/**
 * An object returned by the reporting queries of the {@link OrderDao}
 * @author JB Nizet
 */
public final class ReportingOrder {
    private final Long orderId;
    private final String basketReference;
    private final String customerEmail;
    private final CustomerType customerType;
    private final SupportedLanguage customerLanguage;
    private final Instant basketConfirmationInstant;
    private final String grcName;
    private final String accessionHolderName;
    private final OrderStatus status;
    private final Instant finalizationInstant;
    private final String accessionName;
    private final String accessionIdentifier;
    private final Integer accessionQuantity;
    private final String accessionUnit;

    public ReportingOrder(Long orderId,
                          String basketReference,
                          String customerEmail,
                          CustomerType customerType,
                          SupportedLanguage customerLanguage,
                          Instant basketConfirmationInstant,
                          String grcName,
                          String accessionHolderName,
                          OrderStatus status,
                          Instant finalizationInstant,
                          String accessionName,
                          String accessionIdentifier,
                          Integer accessionQuantity,
                          String accessionUnit) {
        this.orderId = orderId;
        this.basketReference = basketReference;
        this.customerEmail = customerEmail;
        this.customerType = customerType;
        this.customerLanguage = customerLanguage;
        this.basketConfirmationInstant = basketConfirmationInstant;
        this.grcName = grcName;
        this.accessionHolderName = accessionHolderName;
        this.status = status;
        this.finalizationInstant = finalizationInstant;
        this.accessionName = accessionName;
        this.accessionIdentifier = accessionIdentifier;
        this.accessionQuantity = accessionQuantity;
        this.accessionUnit = accessionUnit;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getBasketReference() {
        return basketReference;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public CustomerType getCustomerType() {
        return customerType;
    }

    public SupportedLanguage getCustomerLanguage() {
        return customerLanguage;
    }

    public Instant getBasketConfirmationInstant() {
        return basketConfirmationInstant;
    }

    public String getGrcName() {
        return grcName;
    }

    public String getAccessionHolderName() {
        return accessionHolderName;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public Instant getFinalizationInstant() {
        return finalizationInstant;
    }

    public String getAccessionName() {
        return accessionName;
    }

    public String getAccessionIdentifier() {
        return accessionIdentifier;
    }

    public Integer getAccessionQuantity() {
        return accessionQuantity;
    }

    public String getAccessionUnit() {
        return accessionUnit;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ReportingOrder)) {
            return false;
        }
        ReportingOrder that = (ReportingOrder) o;
        return Objects.equals(orderId, that.orderId) &&
            Objects.equals(basketReference, that.basketReference) &&
            Objects.equals(customerEmail, that.customerEmail) &&
            customerType == that.customerType &&
            customerLanguage == that.customerLanguage &&
            Objects.equals(basketConfirmationInstant, that.basketConfirmationInstant) &&
            Objects.equals(grcName, that.grcName) &&
            Objects.equals(accessionHolderName, that.accessionHolderName) &&
            status == that.status &&
            Objects.equals(finalizationInstant, that.finalizationInstant) &&
            Objects.equals(accessionName, that.accessionName) &&
            Objects.equals(accessionIdentifier, that.accessionIdentifier) &&
            Objects.equals(accessionQuantity, that.accessionQuantity) &&
            Objects.equals(accessionUnit, that.accessionUnit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId,
                            basketReference,
                            customerEmail,
                            customerType,
                            customerLanguage,
                            basketConfirmationInstant,
                            grcName,
                            accessionHolderName,
                            status,
                            finalizationInstant,
                            accessionName,
                            accessionIdentifier,
                            accessionQuantity,
                            accessionUnit);
    }
}
