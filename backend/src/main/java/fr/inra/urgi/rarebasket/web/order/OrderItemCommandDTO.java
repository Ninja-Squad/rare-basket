package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

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

    private final String unit;

    @JsonCreator
    public OrderItemCommandDTO(@JsonProperty("accession") Accession accession,
                               @JsonProperty("quantity") Integer quantity,
                               @JsonProperty("unit") String unit) {
        this.accession = accession;
        this.quantity = quantity;
        this.unit = unit;
    }

    public Accession getAccession() {
        return accession;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getUnit() {
        return unit;
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
            Objects.equals(quantity, that.quantity) &&
            Objects.equals(unit, that.unit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accession, quantity, unit);
    }

    @Override
    public String toString() {
        return "OrderItemCommandDTO{" +
            "accession=" + accession +
            ", quantity=" + quantity +
            ", unit='" + unit + '\'' +
            '}';
    }
}
