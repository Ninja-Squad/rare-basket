package fr.inra.urgi.rarebasket.web.basket;

import java.util.List;
import java.util.Objects;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command used to create a basket
 * @author JB Nizet
 */
public final class BasketCommandDTO {

    @NotEmpty
    private final List<@Valid BasketItemCommandDTO> items;

    @JsonCreator
    public BasketCommandDTO(@JsonProperty("items") List<BasketItemCommandDTO> items) {
        this.items = items;
    }

    public List<BasketItemCommandDTO> getItems() {
        return items;
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
        return Objects.equals(items, that.items);
    }

    @Override
    public int hashCode() {
        return Objects.hash(items);
    }

    @Override
    public String toString() {
        return "BasketCommandDTO{" +
            "items=" + items +
            '}';
    }
}
