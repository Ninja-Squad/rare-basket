package fr.inra.urgi.rarebasket.web.basket;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;

import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.exception.BadRequestException;
import fr.inra.urgi.rarebasket.exception.NotFoundException;
import fr.inra.urgi.rarebasket.service.event.BasketSaved;
import fr.inra.urgi.rarebasket.service.event.EventPublisher;
import fr.inra.urgi.rarebasket.service.event.OrderCreated;
import fr.inra.urgi.rarebasket.util.References;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller used to handle baskets
 * @author JB Nizet
 */
@RestController
@RequestMapping("/api/baskets")
@Transactional
public class BasketController {

    private final BasketDao basketDao;
    private final AccessionHolderDao accessionHolderDao;
    private final OrderDao orderDao;
    private final Validator validator;
    private final EventPublisher eventPublisher;

    public BasketController(BasketDao basketDao,
                            AccessionHolderDao accessionHolderDao,
                            OrderDao orderDao,
                            Validator validator,
                            EventPublisher eventPublisher) {
        this.basketDao = basketDao;
        this.accessionHolderDao = accessionHolderDao;
        this.orderDao = orderDao;
        this.validator = validator;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Endpoint used by RARe (and potentially other applications) to submit a basket, i.e. create a new draft basket
     * that the customer will then have to complete and save.
     * It's also valid to create a basket with already filled customer information, quantities etc.
     * If the command is flagged as complete, then checks are made to be sure that all the required information
     * is present.
     */
    @CrossOrigin("*")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BasketDTO create(@Validated(BasketCommandDTO.Create.class) @RequestBody BasketCommandDTO command) {
        validateIfComplete(command);
        Basket basket = createBasket(command);
        basketDao.save(basket);
        generateConfirmationCodeAndFireSavedEventIfNecessary(basket);
        return new BasketDTO(basket);
    }

    /**
     * Endpoint used by rare-basket to get a basket by its secret reference. Once RARe has created a draft basket,
     * it redirects the user to a rare-basket URL containing the generated secret reference, so that the customer
     * can edit the basket (i.e. fill the customer information, the quantities, etc.)
     */
    @GetMapping("/{basketReference}")
    public BasketDTO get(@PathVariable("basketReference") String basketReference) {
        Basket basket = basketDao.findByReference(basketReference).orElseThrow(NotFoundException::new);
        return new BasketDTO(basket);
    }

    /**
     * Endpoint used by rare-basket to update a basket. The update is allowed until the status is DRAFT.
     * If the command status is SAVED, then additional checks are made to be sure that all the required information
     * is present.
     */
    @PutMapping("/{basketReference}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@PathVariable("basketReference") String basketReference,
                       @Validated(BasketCommandDTO.Update.class) @RequestBody BasketCommandDTO command) {
        validateIfComplete(command);
        Basket basket = basketDao.findByReference(basketReference).orElseThrow(NotFoundException::new);
        if (basket.getStatus() != BasketStatus.DRAFT) {
            throw new BadRequestException("A non-DRAFT basket may not be updated");
        }
        updateBasket(basket, command);

        generateConfirmationCodeAndFireSavedEventIfNecessary(basket);
    }

    /**
     * Endpoint used by rare-basket to confirm a basket
     * @param command the command containing the confirmation code
     */
    @PutMapping("/{basketReference}/confirmation")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirm(@PathVariable("basketReference") String basketReference,
                       @Validated @RequestBody BasketConfirmationCommandDTO command) {
        Basket basket = basketDao.findByReference(basketReference).orElseThrow(NotFoundException::new);
        if (basket.getStatus() != BasketStatus.SAVED) {
            throw new BadRequestException("A non-SAVED basket may not be updated");
        }
        if (!basket.getConfirmationCode().equals(command.getConfirmationCode())) {
            throw new BadRequestException("Incorrect confirmation code");
        }

        basket.setStatus(BasketStatus.CONFIRMED);
        basket.setConfirmationInstant(Instant.now());
        createOrders(basket);
    }

    private void validateIfComplete(@RequestBody @Validated(BasketCommandDTO.Create.class) BasketCommandDTO command) {
        if (command.isComplete()) {
            Set<ConstraintViolation<BasketCommandDTO>> violations =
                validator.validate(command, BasketCommandDTO.Complete.class);
            if (!violations.isEmpty()) {
                throw BadRequestException.fromViolations(violations);
            }
        }
    }

    private Basket createBasket(BasketCommandDTO command) {
        Basket basket = new Basket();
        basket.setReference(References.generateRandomReference());
        basket.setStatus(BasketStatus.DRAFT);

        Map<String, AccessionHolder> accessionHoldersByEmail = new HashMap<>();
        command.getItems().forEach(itemCommand -> {
            BasketItem item = new BasketItem();
            item.setAccession(itemCommand.getAccession());
            AccessionHolder accessionHolder = accessionHoldersByEmail.computeIfAbsent(
                itemCommand.getContactEmail(),
                email -> accessionHolderDao.findByEmail(itemCommand.getContactEmail())
                                           .orElseThrow(() -> new BadRequestException("No accession holder with email " + email))
            );
            item.setAccessionHolder(accessionHolder);
            basket.addItem(item);
        });

        updateBasket(basket, command);

        return basket;
    }

    private void updateBasket(Basket basket, BasketCommandDTO command) {
        basket.setRationale(command.getRationale());
        if (command.getCustomer() != null) {
            Customer customer = basket.getCustomer();
            if (customer == null) {
                customer = new Customer();
                basket.setCustomer(customer);
            }
            customer.setName(command.getCustomer().getName());
            customer.setOrganization(command.getCustomer().getOrganization());
            customer.setEmail(command.getCustomer().getEmail());
            customer.setAddress(command.getCustomer().getAddress());
            customer.setType(command.getCustomer().getType());
            customer.setLanguage(command.getCustomer().getLanguage());
        }
        if (command.isComplete()) {
            basket.setStatus(BasketStatus.SAVED);
        }

        Map<Accession, BasketItemCommandDTO> itemCommandsByAccession =
            command.getItems()
                   .stream()
                   .collect(Collectors.toMap(BasketItemCommandDTO::getAccession, Function.identity()));

        Set<BasketItem> removedItems =
            basket.getItems()
                  .stream()
                  .filter(item -> !itemCommandsByAccession.containsKey(item.getAccession()))
                  .collect(Collectors.toSet());
        removedItems.forEach(basket::removeItem);

        basket.getItems().forEach(item -> {
            BasketItemCommandDTO itemCommand = itemCommandsByAccession.get(item.getAccession());
            item.setQuantity(itemCommand.getQuantity());
            item.setUnit(itemCommand.getUnit());
        });
    }

    private void generateConfirmationCodeAndFireSavedEventIfNecessary(Basket basket) {
        if (basket.getStatus() == BasketStatus.SAVED) {
            basket.setConfirmationCode(References.generateRandomReference());
            eventPublisher.publish(new BasketSaved(basket.getId()));
        }
    }

    private void createOrders(Basket basket) {
        basket.getItems()
              .stream()
              .collect(Collectors.groupingBy(BasketItem::getAccessionHolder))
              .forEach((accessionHolder, basketItems) -> createOrder(basket, accessionHolder, basketItems));
    }

    private void createOrder(Basket basket, AccessionHolder accessionHolder, List<BasketItem> basketItems) {
        Order order = new Order();
        order.setBasket(basket);
        order.setStatus(OrderStatus.DRAFT);
        order.setAccessionHolder(accessionHolder);
        basketItems.forEach(basketItem -> order.addItem(createOrderItem(basketItem)));
        orderDao.save(order);
        eventPublisher.publish(new OrderCreated(order.getId()));
    }

    private OrderItem createOrderItem(BasketItem basketItem) {
        OrderItem orderItem = new OrderItem();
        orderItem.setAccession(basketItem.getAccession());
        orderItem.setQuantity(basketItem.getQuantity());
        orderItem.setUnit(basketItem.getUnit());
        return orderItem;
    }
}
