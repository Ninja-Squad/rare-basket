package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

/**
 * A contact of a GRC, responsible of handling orders.
 * @author JB Nizet
 */
@Entity
public class GrcContact {
    @Id
    @SequenceGenerator(name = "GRC_CONTACT_GENERATOR", sequenceName = "grc_contact_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "GRC_CONTACT_GENERATOR")
    private Long id;

    /**
     * The email identifying the contact (inside the accessions sent from RARe)
     */
    @NotNull
    @Email
    private String email;

    /**
     * The GRC which this contact belongs to
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Grc grc;

    public GrcContact() {
    }

    public GrcContact(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Grc getGrc() {
        return grc;
    }

    public void setGrc(Grc grc) {
        this.grc = grc;
    }
}
