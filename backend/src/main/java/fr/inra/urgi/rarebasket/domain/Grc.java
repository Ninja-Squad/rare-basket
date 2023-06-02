package fr.inra.urgi.rarebasket.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.validation.constraints.NotBlank;

/**
 * A GRC, in charge of a part of all the accessions found in RARe, but splitting the order handling into one or more
 * contact(s)
 * @author JB Nizet
 */
@Entity
public class Grc {
    @Id
    @SequenceGenerator(name = "GRC_GENERATOR", sequenceName = "grc_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "GRC_GENERATOR")
    private Long id;

    @NotBlank
    private String name;

    /**
     * The institution of the GRC, displayed in delivery notices
     */
    @NotBlank
    private String institution;

    /**
     * The address of the GRC, displayed in delivery notices
     */
    @NotBlank
    private String address;

    public Grc() {
    }

    public Grc(Long id) {
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

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
