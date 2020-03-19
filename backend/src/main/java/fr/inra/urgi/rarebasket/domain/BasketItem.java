package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * An item of a basket.
 * @author JB Nizet
 */
@Entity
public class BasketItem {
    @Id
    @SequenceGenerator(name = "BASKET_ITEM_GENERATOR", sequenceName = "basket_item_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BASKET_ITEM_GENERATOR")
    private Long id;

    /**
     * The RARe accession being ordered
     */
    @NotBlank
    private String accession;

    /**
     * The quantity of the accession being ordered.
     * It can only be null if the item is part of a DRAFT basket. Once the basket is saved, it can't be null anymore.
     */
    @Min(1)
    public Integer quantity;

    /**
     * The contact which is in charge of handling this order item
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private GrcContact contact;

    /**
     * The basket that this item is part of
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Basket basket;

    public BasketItem() {
    }

    public BasketItem(Long id) {
        this.id = id;
    }

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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public GrcContact getContact() {
        return contact;
    }

    public void setContact(GrcContact contact) {
        this.contact = contact;
    }

    public Basket getBasket() {
        return basket;
    }

    public void setBasket(Basket basket) {
        this.basket = basket;
    }
}
