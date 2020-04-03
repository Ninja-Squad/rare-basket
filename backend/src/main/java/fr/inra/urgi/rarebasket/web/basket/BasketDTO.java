package fr.inra.urgi.rarebasket.web.basket;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;
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
    private final List<AccessionHolderBasketDTO> accessionHolderBaskets;

    public BasketDTO(Long id,
                     String reference,
                     BasketStatus status,
                     CustomerDTO customer,
                     String rationale,
                     List<AccessionHolderBasketDTO> accessionHolderBaskets) {
        this.id = id;
        this.reference = reference;
        this.status = status;
        this.customer = customer;
        this.rationale = rationale;
        this.accessionHolderBaskets = accessionHolderBaskets;
    }

    public BasketDTO(Basket basket) {
        this(basket.getId(),
             basket.getReference(),
             basket.getStatus(),
             basket.getCustomer() == null ? null : new CustomerDTO(basket.getCustomer()),
             basket.getRationale(),
             createAccessionHolderBaskets(basket));
    }

    private static List<AccessionHolderBasketDTO> createAccessionHolderBaskets(Basket basket) {
        Map<AccessionHolder, List<BasketItem>> itemsByAccessionHolder =
            basket.getItems()
                  .stream()
                  .collect(Collectors.groupingBy(BasketItem::getAccessionHolder));

        return itemsByAccessionHolder
            .entrySet()
            .stream()
            .map(entry -> new AccessionHolderBasketDTO(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparing(AccessionHolderBasketDTO::getGrcName)
                              .thenComparing(AccessionHolderBasketDTO::getAccessionHolderName))
            .collect(Collectors.toList());
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

    public List<AccessionHolderBasketDTO> getAccessionHolderBaskets() {
        return accessionHolderBaskets;
    }
}
