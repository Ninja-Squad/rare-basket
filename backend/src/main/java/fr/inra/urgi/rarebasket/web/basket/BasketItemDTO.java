package fr.inra.urgi.rarebasket.web.basket;

import fr.inra.urgi.rarebasket.domain.BasketItem;

/**
 * DTO containing information about a basket item
 * @author JB Nizet
 */
public final class BasketItemDTO {
    private final Long id;
    private final String accession;
    private final Integer quantity;

    public BasketItemDTO(Long id, String accession, Integer quantity) {
        this.id = id;
        this.accession = accession;
        this.quantity = quantity;
    }

    public BasketItemDTO(BasketItem item) {
        this(item.getId(), item.getAccession(), item.getQuantity());
    }

    public Long getId() {
        return id;
    }

    public String getAccession() {
        return accession;
    }

    public Integer getQuantity() {
        return quantity;
    }
}
