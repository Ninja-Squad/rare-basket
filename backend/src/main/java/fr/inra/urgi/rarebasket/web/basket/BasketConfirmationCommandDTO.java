package fr.inra.urgi.rarebasket.web.basket;

import java.util.Objects;

import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command sent to confirm a basket
 * @author JB Nizet
 */
public final class BasketConfirmationCommandDTO {

    @NotBlank
    private final String confirmationCode;

    @JsonCreator
    public BasketConfirmationCommandDTO(@JsonProperty("confirmationCode") String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BasketConfirmationCommandDTO)) {
            return false;
        }
        BasketConfirmationCommandDTO that = (BasketConfirmationCommandDTO) o;
        return Objects.equals(confirmationCode, that.confirmationCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(confirmationCode);
    }

    @Override
    public String toString() {
        return "BasketConfirmationCommandDTO{" +
            "confirmationCode='" + confirmationCode + '\'' +
            '}';
    }
}
