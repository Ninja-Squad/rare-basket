package fr.inra.urgi.rarebasket.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

/**
 * An order, containing one or several order items.
 * These items are originally a copy of the items of a basket, but the order can be further edited by the
 * accession holder user to remove some items or modify their qantity.
 * @author JB Nizet
 */
@Entity
@Table(name = "accession_order")
public class Order {
    public Order() {
    }

    public Order(Long id) {
        this.id = id;
    }

    @Id
    @SequenceGenerator(name = "ORDER_GENERATOR", sequenceName = "accession_order_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ORDER_GENERATOR")
    private Long id;

    /**
     * The basket which triggered the creation of this order. That's where the information about the customer can be
     * found, among other things.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Basket basket;

    /**
     * The GRC contact in charge of handling this order
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private AccessionHolder accessionHolder;

    /**
     * The items of this order
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> items = new HashSet<>();

    /**
     * The status of the order.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.DRAFT;

    /**
     * The instant when the order was finalized or cancelled (null if the status is DRAFT)
     */
    private Instant closingInstant;

    /**
     * The documents associated to this order (emails, invoice, etc.)
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(
        name = "accession_order_document",
        joinColumns = @JoinColumn(name = "order_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private Set<Document> documents = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Basket getBasket() {
        return basket;
    }

    public void setBasket(Basket basket) {
        this.basket = basket;
    }

    public AccessionHolder getAccessionHolder() {
        return accessionHolder;
    }

    public void setAccessionHolder(AccessionHolder accessionHolder) {
        this.accessionHolder = accessionHolder;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Instant getClosingInstant() {
        return closingInstant;
    }

    public void setClosingInstant(Instant closingInstant) {
        this.closingInstant = closingInstant;
    }


    public Set<OrderItem> getItems() {
        return Collections.unmodifiableSet(items);
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.items.add(item);
    }

    public void removeItem(OrderItem item) {
        this.items.remove(item);
    }

    public Set<Document> getDocuments() {
        return Collections.unmodifiableSet(documents);
    }

    public void setItems(Set<OrderItem> items) {
        this.items.clear();
        items.forEach(this::addItem);
    }

    public void addDocument(Document document) {
        this.documents.add(document);
    }

    public void removeDocument(Document document) {
        this.documents.remove(document);
    }
}
