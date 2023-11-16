package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.web.basket.CustomerCommandDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Command sent by a user to create a new order from scratch.
 * @author JB Nizet
 */
public final class OrderCreationCommandDTO {

    /**
     * The ID of the accession holder for which the order must be created.
     * It must be one of the accession holders of the current user.
     */
    @NotNull
    private final Long accessionHolderId;

    @Valid
    private final CustomerCommandDTO customer;

    private final String rationale;

    public OrderCreationCommandDTO(@JsonProperty("accessionHolderId") Long accessionHolderId,
                                   @JsonProperty("customer") CustomerCommandDTO customer,
                                   @JsonProperty("rationale") String rationale) {
        this.accessionHolderId = accessionHolderId;
        this.customer = customer;
        this.rationale = rationale;
    }

    public Long getAccessionHolderId() {
        return accessionHolderId;
    }

    public CustomerCommandDTO getCustomer() {
        return customer;
    }

    public String getRationale() {
        return rationale;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderCreationCommandDTO)) {
            return false;
        }
        OrderCreationCommandDTO that = (OrderCreationCommandDTO) o;
        return Objects.equals(accessionHolderId, that.accessionHolderId) &&
            Objects.equals(customer, that.customer) &&
            Objects.equals(rationale, that.rationale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accessionHolderId, customer, rationale);
    }

    @Override
    public String toString() {
        return "CustomerInformationCommandDTO{" +
               "accessionHolderId=" + accessionHolderId +
               ", customer=" + customer +
               ", rationale='" + rationale + '\'' +
               '}';
    }
}
