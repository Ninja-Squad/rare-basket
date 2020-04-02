package fr.inra.urgi.rarebasket.web.order;

import java.time.Instant;

import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.web.basket.CustomerDTO;

/**
 * The information regarding the basket of an order
 * @author JB Nizet
 */
public final class BasketInformationDTO {
    private final String reference;
    private final String rationale;
    private final CustomerDTO customer;
    private final Instant confirmationInstant;

    public BasketInformationDTO(String reference,
                                String rationale,
                                CustomerDTO customer,
                                Instant confirmationInstant) {
        this.reference = reference;
        this.rationale = rationale;
        this.customer = customer;
        this.confirmationInstant = confirmationInstant;
    }

    public BasketInformationDTO(Basket basket) {
        this(basket.getReference(),
             basket.getRationale(),
             new CustomerDTO(basket.getCustomer()),
             basket.getConfirmationInstant());
    }

    public String getReference() {
        return reference;
    }

    public String getRationale() {
        return rationale;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public Instant getConfirmationInstant() {
        return confirmationInstant;
    }
}
