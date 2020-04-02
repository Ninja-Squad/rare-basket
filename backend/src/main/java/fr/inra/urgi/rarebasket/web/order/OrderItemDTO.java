package fr.inra.urgi.rarebasket.web.order;

import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.OrderItem;

/**
 * Information about an order item
 * @author JB Nizet
 */
public final class OrderItemDTO {
    private final Long id;
    private final Accession accession;
    private final Integer quantity;

    public OrderItemDTO(Long id, Accession accession, Integer quantity) {
        this.id = id;
        this.accession = accession;
        this.quantity = quantity;
    }

    public OrderItemDTO(OrderItem item) {
        this(item.getId(), item.getAccession(), item.getQuantity());
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
}
