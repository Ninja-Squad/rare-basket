package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import java.util.Set;
import javax.validation.Valid;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command sent to update a command
 * @author JB Nizet
 */
public final class OrderCommandDTO {

    @Size(min = 1)
    private final Set<@Valid OrderItemCommandDTO> items;

    @JsonCreator
    public OrderCommandDTO(@JsonProperty("items") Set<@Valid OrderItemCommandDTO> items) {
        this.items = items;
    }

    public Set<OrderItemCommandDTO> getItems() {
        return items;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderCommandDTO)) {
            return false;
        }
        OrderCommandDTO that = (OrderCommandDTO) o;
        return Objects.equals(items, that.items);
    }

    @Override
    public int hashCode() {
        return Objects.hash(items);
    }

    @Override
    public String toString() {
        return "OrderCommandDTO{" +
            "items=" + items +
            '}';
    }
}
