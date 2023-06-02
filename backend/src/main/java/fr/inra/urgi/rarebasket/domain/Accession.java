package fr.inra.urgi.rarebasket.domain;

import java.util.Comparator;
import java.util.Objects;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * An accession, identified by a name and an identifier
 * @author JB Nizet
 */
@Embeddable
public final class Accession implements Comparable<Accession> {

    private static final Comparator<Accession> COMPARATOR =
        Comparator.comparing(Accession::getName, String.CASE_INSENSITIVE_ORDER)
                  .thenComparing(Accession::getIdentifier, String.CASE_INSENSITIVE_ORDER);

    @NotBlank
    @Column(name = "accession_name")
    private String name;

    @NotBlank
    @Column(name = "accession_identifier")
    private String identifier;

    @JsonCreator
    public Accession(@JsonProperty("name") String name,
                     @JsonProperty("identifier") String identifier) {
        this.name = name;
        this.identifier = identifier;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Accession)) {
            return false;
        }
        Accession accession = (Accession) o;
        return Objects.equals(name, accession.name) &&
            Objects.equals(identifier, accession.identifier);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, identifier);
    }

    @Override
    public String toString() {
        return "Accession{" +
            "name='" + name + '\'' +
            ", identifier='" + identifier + '\'' +
            '}';
    }

    @Override
    public int compareTo(Accession o) {
        return COMPARATOR.compare(this, o);
    }
}
