package fr.inra.urgi.rarebasket.web.basket;

import javax.validation.constraints.Email;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command used to ceate a basket
 * @author JB Nizet
 */
public final class BasketCommandDTO {
    @Email
    private final String email;

    @JsonCreator
    public BasketCommandDTO(@JsonProperty("email") String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
