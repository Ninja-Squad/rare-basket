package fr.inra.urgi.rarebasket.web.basket;

import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;

/**
 * DTO containing the customer information
 * @author JB Nizet
 */
public final class CustomerDTO {
    private final String name;
    private final String organization;
    private final String email;
    private final String address;
    private final CustomerType type;
    private final SupportedLanguage language;

    public CustomerDTO(String name,
                       String organization,
                       String email,
                       String address,
                       CustomerType type,
                       SupportedLanguage language) {
        this.name = name;
        this.organization = organization;
        this.email = email;
        this.address = address;
        this.type = type;
        this.language = language;
    }

    public CustomerDTO(Customer customer) {
        this(customer.getName(),
             customer.getOrganization(),
             customer.getEmail(),
             customer.getAddress(),
             customer.getType(),
             customer.getLanguage());
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
}
