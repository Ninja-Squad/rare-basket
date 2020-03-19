package fr.inra.urgi.rarebasket.web.basket;

import java.util.List;
import java.util.Objects;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.groups.Default;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command used to create a basket
 * @author JB Nizet
 */
public final class BasketCommandDTO {

    @NotEmpty
    private final List<@Valid BasketItemCommandDTO> items;

    @Valid
    @NotNull(groups = Complete.class)
    private CustomerCommandDTO customer;

    private String rationale;
    private boolean complete = false;

    @JsonCreator
    public BasketCommandDTO(
        @JsonProperty("items") List<BasketItemCommandDTO> items,
        @JsonProperty("customer") CustomerCommandDTO customer,
        @JsonProperty("rationale") String rationale,
        @JsonProperty("complete") boolean complete
    ) {
        this.items = items;
        this.customer = customer;
        this.rationale = rationale;
        this.complete = complete;
    }

    public BasketCommandDTO(List<BasketItemCommandDTO> items) {
        this(items, null, null, false);
    }

    public List<BasketItemCommandDTO> getItems() {
        return items;
    }

    public CustomerCommandDTO getCustomer() {
        return customer;
    }

    public String getRationale() {
        return rationale;
    }

    public boolean isComplete() {
        return complete;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BasketCommandDTO)) {
            return false;
        }
        BasketCommandDTO that = (BasketCommandDTO) o;
        return complete == that.complete &&
            Objects.equals(items, that.items) &&
            Objects.equals(customer, that.customer) &&
            Objects.equals(rationale, that.rationale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(items, customer, rationale, complete);
    }

    @Override
    public String toString() {
        return "BasketCommandDTO{" +
            "items=" + items +
            ", customer=" + customer +
            ", rationale='" + rationale + '\'' +
            ", complete=" + complete +
            '}';
    }

    /**
     * The bean validation group used when creating a basket
     */
    interface Create extends Default {}

    /**
     * The bean validation group used when updating a basket
     */
    interface Update extends Default {}

    /**
     * The bean validation group used when creating or updating a basket with <code>complete</code> set to true
     */
    interface Complete extends Default {}
}
