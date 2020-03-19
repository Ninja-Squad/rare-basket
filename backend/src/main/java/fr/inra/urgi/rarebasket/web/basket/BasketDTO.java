package fr.inra.urgi.rarebasket.web.basket;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;

/**
 * DTO for the Basket entity
 * @author JB Nizet
 */
public final class BasketDTO {
    private final Long id;
    private final String reference;
    private final BasketStatus status;
    private final CustomerDTO customer;
    private final String rationale;
    private final List<BasketItemDTO> items;

    public BasketDTO(Long id,
                     String reference,
                     BasketStatus status,
                     CustomerDTO customer,
                     String rationale,
                     List<BasketItemDTO> items) {
        this.id = id;
        this.reference = reference;
        this.status = status;
        this.customer = customer;
        this.rationale = rationale;
        this.items = items;
    }

    public BasketDTO(Basket basket) {
        this(basket.getId(),
             basket.getReference(),
             basket.getStatus(),
             basket.getCustomer() == null ? null : new CustomerDTO(basket.getCustomer()),
             basket.getRationale(),
             basket.getItems()
                   .stream()
                   .sorted(Comparator.comparing(BasketItem::getAccession))
                   .map(BasketItemDTO::new)
                   .collect(Collectors.toList()));
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public BasketStatus getStatus() {
        return status;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public String getRationale() {
        return rationale;
    }

    public List<BasketItemDTO> getItems() {
        return items;
    }
}
