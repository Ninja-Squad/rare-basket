package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import jakarta.validation.Valid;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.web.basket.CustomerCommandDTO;

/**
 * Command sent by a user to edit the customer information of an order (and thus also
 * of the other orders of the same basket), and also to create a new order from scratch.
 * @author JB Nizet
 */
public final class CustomerInformationCommandDTO {

    /**
     * When used to create a new order, this is the ID of the accession holder for which the order must be created.
     * The accession holder must be one of the accession holders of the current user.
     */
    private final Long accessionHolderId;

    @Valid
    private final CustomerCommandDTO customer;

    private final String rationale;

    public CustomerInformationCommandDTO(@JsonProperty("accessionHolderId") Long accessionHolderId,
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
        if (!(o instanceof CustomerInformationCommandDTO)) {
            return false;
        }
        CustomerInformationCommandDTO that = (CustomerInformationCommandDTO) o;
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
