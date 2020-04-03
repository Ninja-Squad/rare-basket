package fr.inra.urgi.rarebasket.web.basket;

import java.util.Objects;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;

/**
 * Command containing the information about a customer
 * @author JB Nizet
 */
public final class CustomerCommandDTO {
    @NotBlank(groups = BasketCommandDTO.Complete.class)
    private final String name;

    @NotNull(groups = BasketCommandDTO.Complete.class)
    @Email
    private final String email;

    @NotBlank(groups = BasketCommandDTO.Complete.class)
    private final String address;

    @NotNull(groups = BasketCommandDTO.Complete.class)
    private final CustomerType type;

    @NotNull(groups = BasketCommandDTO.Complete.class)
    private final SupportedLanguage language;

    @JsonCreator
    public CustomerCommandDTO(@JsonProperty("name") String name,
                              @JsonProperty("email") String email,
                              @JsonProperty("address") String address,
                              @JsonProperty("type") CustomerType type,
                              @JsonProperty("language") SupportedLanguage language) {
        this.name = name;
        this.email = email;
        this.address = address;
        this.type = type;
        this.language = language;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public CustomerType getType() {
        return type;
    }

    public SupportedLanguage getLanguage() {
        return language;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CustomerCommandDTO)) {
            return false;
        }
        CustomerCommandDTO that = (CustomerCommandDTO) o;
        return Objects.equals(name, that.name) &&
            Objects.equals(email, that.email) &&
            Objects.equals(address, that.address) &&
            type == that.type &&
            language == that.language;
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, email, address, type, language);
    }

    @Override
    public String toString() {
        return "CustomerCommandDTO{" +
            "name='" + name + '\'' +
            ", email='" + email + '\'' +
            ", address='" + address + '\'' +
            ", type=" + type +
            ", language=" + language +
            '}';
    }
}
