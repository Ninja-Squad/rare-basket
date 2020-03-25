package fr.inra.urgi.rarebasket.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.NotNull;

/**
 * A basket. The list of items it contains is what is sent from Rare when a customer sends a order from its basket.
 * The basket then stays in the draft status until the customer has filled the missing information (name, email,
 * quantity, of each item, etc.). Once it's saved, the basket is split into basket orders: one order per distinct
 * contact found in the items. Each basket order can be seen as a copy of the items of the basket associated with a
 * given contact.
 * @author JB Nizet
 */
@Entity
public class Basket {
    @Id
    @SequenceGenerator(name = "BASKET_GENERATOR", sequenceName = "basket_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "BASKET_GENERATOR")
    private Long id;

    /**
     * A secret random reference allowing to uniquely identify the basket, so that only the anonymous customer
     * who created it can edit it
     */
    @NotNull
    private String reference;

    /**
     * The information about the customer
     */
    @Embedded
    private Customer customer;

    /**
     * The status of the order. While it's DRAFT, the customer can still edit it (remove items, specify their quantity,
     * fill the customer information, etc.). Once SAVED, it's immutable: the order has been splitted into
     * basket orders (one by distinct contact)
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    private BasketStatus status = BasketStatus.DRAFT;

    /**
     * The instant when the basket was created (typically by sending it from Rare)
     */
    @NotNull
    private Instant creationInstant = Instant.now();

    /**
     * A text describing why this order was requested by the customer.
     */
    private String rationale;

    @OneToMany(mappedBy = "basket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BasketItem> items = new HashSet<>();

    /**
     * The random confirmation code generated when the basket is saved. It's used to check that the customer
     * has indeed made the basket by sending an email containing this code and asking the user to confirm the basket.
     */
    private String confirmationCode;

    /**
     * The instant when the customer confirmed this order, i.e. made its status go
     * from SAVED to CONFIRMED.
     */
    private Instant confirmationInstant;

    public Basket() {
    }

    public Basket(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public BasketStatus getStatus() {
        return status;
    }

    public void setStatus(BasketStatus status) {
        this.status = status;
    }

    public Instant getCreationInstant() {
        return creationInstant;
    }

    public void setCreationInstant(Instant creationInstant) {
        this.creationInstant = creationInstant;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public Set<BasketItem> getItems() {
        return Collections.unmodifiableSet(items);
    }

    public void addItem(BasketItem item) {
        item.setBasket(this);
        this.items.add(item);
    }

    public void removeItem(BasketItem item) {
        this.items.remove(item);
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public Instant getConfirmationInstant() {
        return confirmationInstant;
    }

    public void setConfirmationInstant(Instant confirmationInstant) {
        this.confirmationInstant = confirmationInstant;
    }
}
