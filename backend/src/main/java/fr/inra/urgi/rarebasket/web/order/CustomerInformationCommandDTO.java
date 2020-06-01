package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import javax.validation.Valid;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.web.basket.CustomerCommandDTO;

/**
 * Command sent by a user to edit the customer information of an order (and thus also
 * of the other orders of the same basket)
 * @author JB Nizet
 */
public final class CustomerInformationCommandDTO {
    @Valid
    private final CustomerCommandDTO customer;

    private final String rationale;

    public CustomerInformationCommandDTO(@JsonProperty("customer") CustomerCommandDTO customer,
                                         @JsonProperty("rationale") String rationale) {
        this.customer = customer;
        this.rationale = rationale;
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
        return Objects.equals(customer, that.customer) &&
            Objects.equals(rationale, that.rationale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customer, rationale);
    }

    @Override
    public String toString() {
        return "CustomerInformationCommandDTO{" +
            "customer=" + customer +
            ", rationale='" + rationale + '\'' +
            '}';
    }
}
