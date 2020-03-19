package fr.inra.urgi.rarebasket.web.basket;

import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketStatus;

/**
 * DTO for the Basket entity
 * @author JB Nizet
 */
public final class BasketDTO {
    private final Long id;
    private final String reference;
    private final BasketStatus status;

    public BasketDTO(Long id, String reference, BasketStatus status) {
        this.id = id;
        this.reference = reference;
        this.status = status;
    }

    public BasketDTO(Basket basket) {
        this(basket.getId(), basket.getReference(), basket.getStatus());
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public BasketStatus getStatus() {
        return status;
    }
}
