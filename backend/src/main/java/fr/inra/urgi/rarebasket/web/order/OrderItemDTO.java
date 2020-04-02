package fr.inra.urgi.rarebasket.web.order;

import fr.inra.urgi.rarebasket.domain.OrderItem;

/**
 * Information about an order item
 * @author JB Nizet
 */
public final class OrderItemDTO {
    private final Long id;
    private final String accession;
    private final int quantity;

    public OrderItemDTO(Long id, String accession, int quantity) {
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

    public String getAccession() {
        return accession;
    }

    public int getQuantity() {
        return quantity;
    }
}
