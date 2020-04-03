package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.validation.Valid;
import javax.validation.constraints.Min;
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
    @NotNull
    @Valid
    private Accession accession;

    /**
     * The quantity of the accession being ordered.
     * When coming from RARe, the quantity is always null. But in order to make it possible later, or for
     * other applications, to pre-fill quantities, we keep this field here.
     */
    @Min(1)
    public Integer quantity;

    /**
     * The contact which is in charge of handling this order item
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private AccessionHolder accessionHolder;

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

    public AccessionHolder getAccessionHolder() {
        return accessionHolder;
    }

    public void setAccessionHolder(AccessionHolder accessionHolder) {
        this.accessionHolder = accessionHolder;
    }

    public Basket getBasket() {
        return basket;
    }

    public void setBasket(Basket basket) {
        this.basket = basket;
    }
}
