package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

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
    @NotBlank
    private String accession;

    /**
     * The quantity of the accession being ordered.
     */
    @Min(1)
    public int quantity;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccession() {
        return accession;
    }

    public void setAccession(String accession) {
        this.accession = accession;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
