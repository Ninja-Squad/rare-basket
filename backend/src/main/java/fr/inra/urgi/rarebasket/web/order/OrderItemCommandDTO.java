package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.Accession;

/**
 * An item of an {@link OrderCommandDTO}
 * @author JB Nizet
 */
public final class OrderItemCommandDTO {
    @NotNull
    @Valid
    private final Accession accession;

    @Min(1)
    private final Integer quantity;

    @JsonCreator
    public OrderItemCommandDTO(@JsonProperty("accession") Accession accession,
                               @JsonProperty("quantity") Integer quantity) {
        this.accession = accession;
        this.quantity = quantity;
    }

    public Accession getAccession() {
        return accession;
    }

    public Integer getQuantity() {
        return quantity;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderItemCommandDTO)) {
            return false;
        }
        OrderItemCommandDTO that = (OrderItemCommandDTO) o;
        return Objects.equals(accession, that.accession) &&
            Objects.equals(quantity, that.quantity);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accession, quantity);
    }

    @Override
    public String toString() {
        return "OrderItemCommandDTO{" +
            "accession=" + accession +
            ", quantity=" + quantity +
            '}';
    }
}
