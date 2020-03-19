package fr.inra.urgi.rarebasket.web.basket;

import java.util.Objects;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * An item of basket command
 * @author JB Nizet
 */
public final class BasketItemCommandDTO {

    /**
     * The accession being ordered
     */
    @NotBlank
    private final String accession;

    /**
     * The email of the GRC contact in charge of handling this ordered item
     */
    @NotNull
    @Email
    private final String contactEmail;

    @JsonCreator
    public BasketItemCommandDTO(@JsonProperty("accession") String accession,
                                @JsonProperty("contactEmail") String contactEmail) {
        this.accession = accession;
        this.contactEmail = contactEmail;
    }

    public String getAccession() {
        return accession;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BasketItemCommandDTO)) {
            return false;
        }
        BasketItemCommandDTO that = (BasketItemCommandDTO) o;
        return Objects.equals(accession, that.accession) &&
            Objects.equals(contactEmail, that.contactEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accession, contactEmail);
    }

    @Override
    public String toString() {
        return "BasketItemCommandDTO{" +
            "accession='" + accession + '\'' +
            ", contactEmail='" + contactEmail + '\'' +
            '}';
    }
}
