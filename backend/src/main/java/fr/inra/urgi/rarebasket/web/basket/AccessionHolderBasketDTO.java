package fr.inra.urgi.rarebasket.web.basket;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.BasketItem;

/**
 * DTO containing the items of a basket of a given accession holder
 * @author JB Nizet
 */
public class AccessionHolderBasketDTO {
    private final String accessionHolderName;
    private final String grcName;

    private final List<BasketItemDTO> items;

    public AccessionHolderBasketDTO(String accessionHolderName,
                                    String grcName,
                                    List<BasketItemDTO> items) {
        this.accessionHolderName = accessionHolderName;
        this.grcName = grcName;
        this.items = items;
    }

    public AccessionHolderBasketDTO(AccessionHolder accessionHolder, List<BasketItem> items) {
        this(accessionHolder.getName(),
             accessionHolder.getGrc().getName(),
             items.stream()
                  .sorted(Comparator.comparing(BasketItem::getAccession))
                  .map(BasketItemDTO::new)
                  .collect(Collectors.toList()));
    }

    public String getAccessionHolderName() {
        return accessionHolderName;
    }

    public String getGrcName() {
        return grcName;
    }

    public List<BasketItemDTO> getItems() {
        return items;
    }
}
