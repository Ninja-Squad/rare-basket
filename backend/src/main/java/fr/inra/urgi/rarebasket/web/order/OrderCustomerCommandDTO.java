package fr.inra.urgi.rarebasket.web.order;

import java.util.Objects;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;

/**
 * Command sent by a user to edit the customer information of an order (and thus also
 * of the other orders of the same basket)
 * @author JB Nizet
 */
public final class OrderCustomerCommandDTO {
    @NotBlank
    private final String name;

    private final String organization;

    @NotNull
    @Email
    private final String email;

    @NotBlank
    private final String address;

    @NotNull
    private final CustomerType type;

    @NotNull
    private final SupportedLanguage language;

    public OrderCustomerCommandDTO(@JsonProperty("name") String name,
                                   @JsonProperty("organization") String organization,
                                   @JsonProperty("email") String email,
                                   @JsonProperty("address") String address,
                                   @JsonProperty("type") CustomerType type,
                                   @JsonProperty("language") SupportedLanguage language) {
        this.name = name;
        this.organization = organization;
        this.email = email;
        this.address = address;
        this.type = type;
        this.language = language;
    }

    public String getName() {
        return name;
    }

    public String getOrganization() {
        return organization;
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
        if (!(o instanceof OrderCustomerCommandDTO)) {
            return false;
        }
        OrderCustomerCommandDTO that = (OrderCustomerCommandDTO) o;
        return Objects.equals(name, that.name) &&
            Objects.equals(organization, that.organization) &&
            Objects.equals(email, that.email) &&
            Objects.equals(address, that.address) &&
            type == that.type &&
            language == that.language;
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, organization, email, address, type, language);
    }

    @Override
    public String toString() {
        return "OrderCustomerCommandDTO{" +
            "name='" + name + '\'' +
            ", organization='" + organization + '\'' +
            ", email='" + email + '\'' +
            ", address='" + address + '\'' +
            ", type=" + type +
            ", language=" + language +
            '}';
    }
}
