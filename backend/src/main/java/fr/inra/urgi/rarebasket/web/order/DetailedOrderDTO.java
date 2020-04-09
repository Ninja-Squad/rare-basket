package fr.inra.urgi.rarebasket.web.order;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import fr.inra.urgi.rarebasket.domain.Document;
import fr.inra.urgi.rarebasket.domain.Order;

/**
 * DTO containing the basic information about an order, and also its documents
 * @author JB Nizet
 */
public final class DetailedOrderDTO {
    @JsonUnwrapped
    private final OrderDTO order;

    private final List<DocumentDTO> documents;

    public DetailedOrderDTO(OrderDTO order, List<DocumentDTO> documents) {
        this.order = order;
        this.documents = documents;
    }

    public DetailedOrderDTO(Order order) {
        this(new OrderDTO(order),
             order.getDocuments()
                  .stream()
                  .sorted(Comparator.comparing(Document::getCreationInstant))
                  .map(DocumentDTO::new)
                  .collect(Collectors.toList())
        );
    }

    public OrderDTO getOrder() {
        return order;
    }

    public List<DocumentDTO> getDocuments() {
        return documents;
    }
}
