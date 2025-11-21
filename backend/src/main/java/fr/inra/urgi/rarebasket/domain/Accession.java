package fr.inra.urgi.rarebasket.domain;

import java.util.Comparator;
import java.util.Objects;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.URL;

/**
 * An accession, identified by a name and an identifier, which comes from a basket created in an external application
 * or from a new order created by a user of this app.
 * Depending on the origin of the accession, some fields are mandatory and others are not.
 * Besides, some properties that are always mandatory were not mandatory in the past, which prevents us from
 * making them mandatory here.
 * @author JB Nizet
 */
@Embeddable
public final class Accession implements Comparable<Accession> {

    private static final Comparator<Accession> COMPARATOR =
        Comparator.comparing(Accession::getName, String.CASE_INSENSITIVE_ORDER)
                  .thenComparing(Accession::getIdentifier, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER))
                  .thenComparing(Accession::getAccessionNumber, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER))
                  .thenComparing(Accession::getTaxon, Comparator.nullsFirst(String.CASE_INSENSITIVE_ORDER));

    /**
     * The name of the assertion. Always mandatory.
     */
    @NotBlank
    @Column(name = "accession_name")
    private String name;

    /**
     * The functional identifier of the accession. Mandatory when coming from an external app. But not entered when
     * coming from a user.
     */
    @Column(name = "accession_identifier")
    private String identifier;

    /**
     * The accession number of the accession. Never mandatory. Some external apps (Rare) don't even have that
     * information
     */
    @Column(name = "accession_number")
    private String accessionNumber;

    /**
     * The taxon of the accession. Always mandatory, but absent from old accessions.
     */
    @Column(name = "accession_taxon")
    private String taxon;

    /**
     * The URL of the accession. Only mandatory when coming from external app, but not entered by users.
     */
    @Column(name = "accession_url")
    @URL
    private String url;

    @JsonCreator
    public Accession(
        @JsonProperty("name") String name,
        @JsonProperty("identifier") String identifier,
        @JsonProperty("accessionNumber") String accessionNumber,
        @JsonProperty("taxon") String taxon,
        @JsonProperty("url") String url
    ) {
        this.name = name;
        this.identifier = identifier;
        this.accessionNumber = accessionNumber;
        this.taxon = taxon;
        this.url = url;
    }

    private Accession() {
        // for JPA
    }

    public String getName() {
        return name;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getAccessionNumber() {
        return accessionNumber;
    }

    public String getTaxon() {
        return taxon;
    }

    public String getUrl() {
        return url;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Accession accession = (Accession) o;
        return Objects.equals(name, accession.name)
               && Objects.equals(identifier, accession.identifier)
               && Objects.equals(accessionNumber, accession.accessionNumber)
               && Objects.equals(taxon, accession.taxon)
               && Objects.equals(url, accession.url);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, identifier, accessionNumber, taxon, url);
    }

    @Override
    public int compareTo(Accession o) {
        return COMPARATOR.compare(this, o);
    }
}
