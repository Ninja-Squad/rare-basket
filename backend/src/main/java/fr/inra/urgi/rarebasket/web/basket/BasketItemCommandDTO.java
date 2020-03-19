package fr.inra.urgi.rarebasket.web.basket;

import java.util.Objects;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

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
    @NotNull(groups = BasketCommandDTO.Create.class)
    @Email(groups = BasketCommandDTO.Create.class)
    @Null(groups = BasketCommandDTO.Update.class)
    private final String contactEmail;

    @NotNull(groups = BasketCommandDTO.Complete.class)
    @Min(value = 1)
    private Integer quantity;

    @JsonCreator
    public BasketItemCommandDTO(@JsonProperty("accession") String accession,
                                @JsonProperty("contactEmail") String contactEmail,
                                @JsonProperty("quantity") Integer quantity) {
        this.accession = accession;
        this.contactEmail = contactEmail;
        this.quantity = quantity;
    }

    public BasketItemCommandDTO(String accession,
                                String contactEmail) {
        this(accession, contactEmail, null);
    }

    public BasketItemCommandDTO(String accession,
                                Integer quantity) {
        this(accession, null, quantity);
    }

    public String getAccession() {
        return accession;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public Integer getQuantity() {
        return quantity;
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
            Objects.equals(contactEmail, that.contactEmail) &&
            Objects.equals(quantity, that.quantity);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accession, contactEmail, quantity);
    }

    @Override
    public String toString() {
        return "BasketItemCommandDTO{" +
            "accession='" + accession + '\'' +
            ", contactEmail='" + contactEmail + '\'' +
            ", quantity=" + quantity +
            '}';
    }
}
