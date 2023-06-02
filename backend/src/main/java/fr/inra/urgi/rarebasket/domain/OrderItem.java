package fr.inra.urgi.rarebasket.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * The item of an {@link Order}, which is initially a copy of an item of a {@link Basket}, but which is copied
 * in order to
 * <ul>
 *   <li>have its own modifiable quantity (that doesn't affect the originally ordered quantity),</li>
 *   <li>be removable from its order</li>
 *   <li>Have a non-null quantity</li>
 *   <li>Not have a contact, since all the items of an order have the same contact</li>
 * </ul>
 *
 * @author JB Nizet
 */
@Entity
@Table(name = "accession_order_item")
public class OrderItem {
    @Id
    @SequenceGenerator(name = "ORDER_ITEM_GENERATOR", sequenceName = "accession_order_item_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ORDER_ITEM_GENERATOR")
    private Long id;

    /**
     * The RARe accession being ordered
     */
    @NotNull
    @Valid
    private Accession accession;

    /**
     * The quantity of the accession being ordered.
     * While the order is a DRAFT order, the quantity can be null. When finalized, the
     * quantity may not be null anymore.
     */
    @Min(1)
    private Integer quantity;

    /**
     * The unit of the quantity (bags, grams, seeds, etc.)
     * It's always optional, but can be specified for more clarity.
     */
    private String unit;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    public OrderItem() {
    }

    public OrderItem(Long id, Accession accession, Integer quantity, String unit) {
        this.id = id;
        this.accession = accession;
        this.quantity = quantity;
        this.unit = unit;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Accession getAccession() {
        return accession;
    }

    public void setAccession(Accession accession) {
        this.accession = accession;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
