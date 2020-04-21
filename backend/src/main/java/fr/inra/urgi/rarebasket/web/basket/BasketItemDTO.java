package fr.inra.urgi.rarebasket.web.basket;

import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.BasketItem;

/**
 * DTO containing information about a basket item
 * @author JB Nizet
 */
public final class BasketItemDTO {
    private final Long id;
    private final Accession accession;
    private final Integer quantity;
    private final String unit;

    public BasketItemDTO(Long id, Accession accession, Integer quantity, String unit) {
        this.id = id;
        this.accession = accession;
        this.quantity = quantity;
        this.unit = unit;
    }

    public BasketItemDTO(BasketItem item) {
        this(item.getId(), item.getAccession(), item.getQuantity(), item.getUnit());
    }

    public Long getId() {
        return id;
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
}
