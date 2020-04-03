package fr.inra.urgi.rarebasket.domain;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * An accession holder, part of a GRC, responsible of handling orders.
 * @author JB Nizet
 */
@Entity
public class AccessionHolder {
    @Id
    @SequenceGenerator(name = "ACCESSION_HOLDER_GENERATOR", sequenceName = "accession_holder_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ACCESSION_HOLDER_GENERATOR")
    private Long id;

    @NotBlank
    private String name;

    /**
     * The email identifying the accession holder (inside the accessions sent from RARe)
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

    public AccessionHolder() {
    }

    public AccessionHolder(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
