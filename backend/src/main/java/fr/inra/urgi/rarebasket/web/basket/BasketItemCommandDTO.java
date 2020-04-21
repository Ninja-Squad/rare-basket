package fr.inra.urgi.rarebasket.web.basket;

import java.util.Objects;
import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.Accession;

/**
 * An item of basket command
 * @author JB Nizet
 */
public final class BasketItemCommandDTO {

    /**
     * The accession being ordered
     */
    @NotNull
    @Valid
    private final Accession accession;

    /**
     * The email of the accession holder in charge of handling this ordered item
     */
    @NotNull(groups = BasketCommandDTO.Create.class)
    @Email(groups = BasketCommandDTO.Create.class)
    @Null(groups = BasketCommandDTO.Update.class)
    private final String contactEmail;

    @Min(value = 1)
    private Integer quantity;

    private String unit;

    @JsonCreator
    public BasketItemCommandDTO(@JsonProperty("accession") Accession accession,
                                @JsonProperty("contactEmail") String contactEmail,
                                @JsonProperty("quantity") Integer quantity,
                                @JsonProperty("unit") String unit) {
        this.accession = accession;
        this.contactEmail = contactEmail;
        this.quantity = quantity;
        this.unit = unit;
    }

    public BasketItemCommandDTO(Accession accession,
                                String contactEmail) {
        this(accession, contactEmail, null, null);
    }

    public BasketItemCommandDTO(Accession accession,
                                Integer quantity) {
        this(accession, null, quantity, null);
    }

    public Accession getAccession() {
        return accession;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getUnit() {
        return unit;
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
            Objects.equals(quantity, that.quantity) &&
            Objects.equals(unit, that.unit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accession, contactEmail, quantity, unit);
    }

    @Override
    public String toString() {
        return "BasketItemCommandDTO{" +
            "accession=" + accession +
            ", contactEmail='" + contactEmail + '\'' +
            ", quantity=" + quantity +
            ", unit='" + unit + '\'' +
            '}';
    }
}
