package fr.inra.urgi.rarebasket.web.order;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.web.accessionholder.AccessionHolderDTO;
import fr.inra.urgi.rarebasket.web.accessionholder.AccessionHolderLightDTO;

/**
 * DTO containing information about an order
 * @author JB Nizet
 */
public final class OrderDTO {

    private final Long id;
    private final BasketInformationDTO basket;
    private final OrderStatus status;
    private final AccessionHolderLightDTO accessionHolder;
    private final List<OrderItemDTO> items;

    public OrderDTO(Long id,
                    BasketInformationDTO basket,
                    OrderStatus status,
                    AccessionHolderLightDTO accessionHolder,
                    List<OrderItemDTO> items) {
        this.id = id;
        this.basket = basket;
        this.status = status;
        this.accessionHolder = accessionHolder;
        this.items = items;
    }

    public OrderDTO(Order order) {
        this(order.getId(),
             new BasketInformationDTO(order.getBasket()),
             order.getStatus(),
             new AccessionHolderLightDTO(order.getAccessionHolder()),
             order.getItems()
                  .stream()
                  .sorted(Comparator.comparing(OrderItem::getAccession))
                  .map(OrderItemDTO::new)
                  .collect(Collectors.toList())
        );
    }

    public Long getId() {
        return id;
    }

    public BasketInformationDTO getBasket() {
        return basket;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public AccessionHolderLightDTO getAccessionHolder() {
        return accessionHolder;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }
}
