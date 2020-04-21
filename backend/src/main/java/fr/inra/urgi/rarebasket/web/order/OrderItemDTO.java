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
    private final String unit;

    public OrderItemDTO(Long id, Accession accession, Integer quantity, String unit) {
        this.id = id;
        this.accession = accession;
        this.quantity = quantity;
        this.unit = unit;
    }

    public OrderItemDTO(OrderItem item) {
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
