package fr.inra.urgi.rarebasket.domain;

import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.Email;

/**
 * The information about the customer who sends its basket from Rare to buy accessions.
 * @author JB Nizet
 */
@Embeddable
public class Customer {
    @Column(name = "customer_name")
    private String name;

    @Column(name = "customer_organization")
    private String organization;

    @Email
    @Column(name = "customer_email")
    private String email;

    @Column(name = "customer_address")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_language")
    private SupportedLanguage language;

    public Customer() {
    }

    public Customer(String name,
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public CustomerType getType() {
        return type;
    }

    public void setType(CustomerType type) {
        this.type = type;
    }

    public SupportedLanguage getLanguage() {
        return language;
    }

    public void setLanguage(SupportedLanguage language) {
        this.language = language;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Customer)) {
            return false;
        }
        Customer customer = (Customer) o;
        return Objects.equals(name, customer.name) &&
            Objects.equals(organization, customer.organization) &&
            Objects.equals(email, customer.email) &&
            Objects.equals(address, customer.address) &&
            type == customer.type &&
            language == customer.language;
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, organization, email, address, type, language);
    }
}
