package fr.inra.urgi.rarebasket.domain;

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

    @Email
    @Column(name = "customer_email")
    private String email;

    @Column(name = "customer_address")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType type;

    public Customer() {
    }

    public Customer(String name,
                    String email,
                    String address,
                    CustomerType type) {
        this.name = name;
        this.email = email;
        this.address = address;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
