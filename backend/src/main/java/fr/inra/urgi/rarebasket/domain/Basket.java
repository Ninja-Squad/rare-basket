package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

/**
 * A basket
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

    @Email
    private String email;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BasketStatus status = BasketStatus.DRAFT;

    public Basket() {
    }

    public Basket(Long id) {
        this.id = id;
    }

    public Basket(String reference, String email, BasketStatus status) {
        this.reference = reference;
        this.email = email;
        this.status = status;
    }

    public Basket(Long id, String reference, String email, BasketStatus status) {
        this.id = id;
        this.reference = reference;
        this.email = email;
        this.status = status;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BasketStatus getStatus() {
        return status;
    }

    public void setStatus(BasketStatus status) {
        this.status = status;
    }
}
