package fr.inra.urgi.rarebasket.web.basket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.AccessionHolderDao;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.OrderDao;
import fr.inra.urgi.rarebasket.domain.Accession;
import fr.inra.urgi.rarebasket.domain.AccessionHolder;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.Grc;
import fr.inra.urgi.rarebasket.domain.Order;
import fr.inra.urgi.rarebasket.domain.OrderItem;
import fr.inra.urgi.rarebasket.domain.OrderStatus;
import fr.inra.urgi.rarebasket.domain.SupportedLanguage;
import fr.inra.urgi.rarebasket.service.event.BasketSaved;
import fr.inra.urgi.rarebasket.service.event.EventPublisher;
import fr.inra.urgi.rarebasket.service.event.OrderCreated;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for BasketController
 * @author JB Nizet
 */
@WebMvcTest(BasketController.class)
@ActiveProfiles("test")
class BasketControllerTest {

    @MockBean
    private BasketDao mockBasketDao;

    @MockBean
    private AccessionHolderDao mockAccessionHolderDao;

    @MockBean
    private OrderDao mockOrderDao;

    @MockBean
    private EventPublisher mockEventPublisher;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Basket basket;
    private BasketItem rosa;
    private BasketItem violetta;

    private AccessionHolder john;
    private AccessionHolder alice;

    @BeforeEach
    void prepare() {
        Grc grc = new Grc();
        grc.setName("GRC1");

        john = new AccessionHolder(1L);
        john.setEmail("john@mail.com");
        john.setName("John");
        john.setGrc(grc);
        alice = new AccessionHolder(2L);
        alice.setEmail("alice@mail.com");
        alice.setName("Alice");
        alice.setGrc(grc);

        List.of(john, alice).forEach(
            accessionHolder -> when(mockAccessionHolderDao.findByEmail(accessionHolder.getEmail()))
                .thenReturn(Optional.of(accessionHolder))
        );

        basket = new Basket(42L);
        basket.setReference("ref");
        basket.setStatus(BasketStatus.DRAFT);
        basket.setCustomer(new Customer("jb", "jb@mail.com", "Saint Just", CustomerType.FARMER, SupportedLanguage.FRENCH));
        basket.setRationale("why not?");

        rosa = new BasketItem(5L);
        rosa.setAccession(new Accession("rosa", "rosa1"));
        rosa.setQuantity(2);
        rosa.setAccessionHolder(john);
        basket.addItem(rosa);

        violetta = new BasketItem(3L);
        violetta.setAccession(new Accession("violetta", "violetta1"));
        violetta.setQuantity(null);
        violetta.setAccessionHolder(alice);
        basket.addItem(violetta);

        when(mockBasketDao.findByReference(basket.getReference())).thenReturn(Optional.of(basket));
    }

    @Test
    void shouldNotCreateEmptyBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(List.of());
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithInvalidContactEmail() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), "notAnEmail"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithAbsentOrInvalidAccession() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(null, john.getEmail()))
        );
        checkBadRequestWhenCreating(command);

        command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("  ", "rosa1"), john.getEmail()))
        );
        checkBadRequestWhenCreating(command);

        command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", " "), john.getEmail()))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithUnexistingAccessionHolder() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), "unexisting@mail.com"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithInvalidCustomer() throws Exception {
        CustomerCommandDTO customer =
            new CustomerCommandDTO(
                "validName",
                "notAnEmail",
                "address",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH
            );

        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), john.getEmail())),
            customer,
            "rationale",
            false
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithInvalidQuantity() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), john.getEmail(), 0))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateCompleteBasketWithIncompleteCustomer() throws Exception {
        List<CustomerCommandDTO> invalidCustomers = List.of(
            new CustomerCommandDTO(
                "",
                "foo@bar.com",
                "address",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH
            ),
            new CustomerCommandDTO(
                "validName",
                null,
                "address",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH
            ),
            new CustomerCommandDTO(
                "validName",
                "notAnEmail",
                "address",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH
            ),
            new CustomerCommandDTO(
                "validName",
                "foo@bar.com",
                "",
                CustomerType.FARMER,
                SupportedLanguage.FRENCH
            ),
            new CustomerCommandDTO(
                "validName",
                "foo@bar.com",
                "",
                null,
                SupportedLanguage.FRENCH
            ),
            new CustomerCommandDTO(
                "validName",
                "foo@bar.com",
                "",
                CustomerType.FARMER,
                null
            )
        );
        for (CustomerCommandDTO customer : invalidCustomers) {
            BasketCommandDTO command = new BasketCommandDTO(
                List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), john.getEmail())),
                customer,
                "rationale",
                true
            );
            checkBadRequestWhenCreating(command);
        }
    }

    @Test
    void shouldCreateADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                new BasketItemCommandDTO(new Accession("rosa", "rosa1"), john.getEmail()),
                new BasketItemCommandDTO(new Accession("violetta", "violetta1"), john.getEmail()),
                new BasketItemCommandDTO(new Accession("amanita", "amanita1"), alice.getEmail())
            )
        );

        when(mockBasketDao.save(any())).thenAnswer(MoreAnswers.<Basket>firstArgWith(b -> b.setId(42L)));

        mockMvc.perform(post("/api/baskets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(42L))
               .andExpect(jsonPath("$.reference").isNotEmpty())
               .andExpect(jsonPath("$.status").value(BasketStatus.DRAFT.name()));

        ArgumentCaptor<Basket> basketCaptor = ArgumentCaptor.forClass(Basket.class);
        verify(mockBasketDao).save(basketCaptor.capture());

        Basket savedBasket = basketCaptor.getValue();
        assertThat(savedBasket.getCreationInstant()).isNotNull();
        assertThat(savedBasket.getItems()).hasSize(3);
        assertThat(savedBasket.getItems())
            .extracting(BasketItem::getAccession, BasketItem::getAccessionHolder, BasketItem::getBasket)
            .containsOnly(
                tuple(new Accession("rosa", "rosa1"), john, savedBasket),
                tuple(new Accession("violetta", "violetta1"), john, savedBasket),
                tuple(new Accession("amanita", "amanita1"), alice, savedBasket)
            );

        verify(mockEventPublisher, never()).publish(any());
    }

    @Test
    void shouldCreateACompleteBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                new BasketItemCommandDTO(new Accession("rosa", "rosa1"), john.getEmail(), 1),
                new BasketItemCommandDTO(new Accession("violetta", "violetta1"), john.getEmail(), 2),
                new BasketItemCommandDTO(new Accession("amanita", "amanita1"), alice.getEmail(), 3)
            ),
            new CustomerCommandDTO(
                "Jack",
                "jack@mail.com",
                "21 Jump street",
                CustomerType.BIOLOGIST,
                SupportedLanguage.ENGLISH
            ),
            "because...",
            true
        );

        when(mockBasketDao.save(any())).thenAnswer(MoreAnswers.<Basket>firstArgWith(b -> b.setId(42L)));

        mockMvc.perform(post("/api/baskets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(42L))
               .andExpect(jsonPath("$.reference").isNotEmpty())
               .andExpect(jsonPath("$.status").value(BasketStatus.SAVED.name()));

        ArgumentCaptor<Basket> basketCaptor = ArgumentCaptor.forClass(Basket.class);
        verify(mockBasketDao).save(basketCaptor.capture());

        Basket savedBasket = basketCaptor.getValue();
        assertThat(savedBasket.getCreationInstant()).isNotNull();
        assertThat(savedBasket.getItems()).hasSize(3);
        assertThat(savedBasket.getItems())
            .extracting(BasketItem::getAccession, BasketItem::getAccessionHolder, BasketItem::getQuantity, BasketItem::getBasket)
            .containsOnly(
                tuple(new Accession("rosa", "rosa1"), john, 1, savedBasket),
                tuple(new Accession("violetta", "violetta1"), john, 2, savedBasket),
                tuple(new Accession("amanita", "amanita1"), alice, 3, savedBasket)
            );
        assertThat(savedBasket.getStatus()).isEqualTo(BasketStatus.SAVED);
        assertThat(savedBasket.getCustomer()).isEqualTo(new Customer(command.getCustomer().getName(),
                                                                     command.getCustomer().getEmail(),
                                                                     command.getCustomer().getAddress(),
                                                                     command.getCustomer().getType(),
                                                                     command.getCustomer().getLanguage()));
        assertThat(savedBasket.getRationale()).isEqualTo(command.getRationale());

        verify(mockEventPublisher).publish(new BasketSaved(savedBasket.getId()));
    }

    @Test
    void shouldGet() throws Exception {
        mockMvc.perform(get("/api/baskets/{reference}", basket.getReference()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(basket.getId()))
               .andExpect(jsonPath("$.reference").value(basket.getReference()))
               .andExpect(jsonPath("$.status").value(basket.getStatus().name()))
               .andExpect(jsonPath("$.rationale").value(basket.getRationale()))
               .andExpect(jsonPath("$.customer.name").value(basket.getCustomer().getName()))
               .andExpect(jsonPath("$.customer.email").value(basket.getCustomer().getEmail()))
               .andExpect(jsonPath("$.customer.address").value(basket.getCustomer().getAddress()))
               .andExpect(jsonPath("$.customer.type").value(basket.getCustomer().getType().name()))
               .andExpect(jsonPath("$.customer.language").value(basket.getCustomer().getLanguage().getLanguageCode()))
               .andExpect(jsonPath("$.accessionHolderBaskets.length()").value(2))
               .andExpect(jsonPath("$.accessionHolderBaskets[0].grcName").value("GRC1"))
               .andExpect(jsonPath("$.accessionHolderBaskets[0].accessionHolderName").value("Alice"))
               .andExpect(jsonPath("$.accessionHolderBaskets[0].items.length()").value(1))
               .andExpect(jsonPath("$.accessionHolderBaskets[0].items[0].id").value(violetta.getId()))
               .andExpect(jsonPath("$.accessionHolderBaskets[0].items[0].quantity").isEmpty())
               .andExpect(jsonPath("$.accessionHolderBaskets[1].items[0].id").value(rosa.getId()))
               .andExpect(jsonPath("$.accessionHolderBaskets[1].items[0].accession.name").value(rosa.getAccession().getName()))
               .andExpect(jsonPath("$.accessionHolderBaskets[1].items[0].accession.identifier").value(rosa.getAccession().getIdentifier()))
               .andExpect(jsonPath("$.accessionHolderBaskets[1].items[0].quantity").value(rosa.getQuantity()));
    }

    @Test
    void shouldNotUpdateANonDraftBasket() throws Exception {
        basket.setStatus(BasketStatus.SAVED);

        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), 5))
        );
        checkBadRequestWhenUpdating(command);
    }

    @Test
    void shouldNotUpdateADraftBasketWithContactEmails() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO(new Accession("rosa", "rosa1"), "john@mail.com"))
        );
        checkBadRequestWhenUpdating(command);
    }

    @Test
    void shouldUpdateADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                new BasketItemCommandDTO(rosa.getAccession(), 5),
                new BasketItemCommandDTO(violetta.getAccession(), 10)
            )
        );

        mockMvc.perform(put("/api/baskets/{reference}", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(rosa.getQuantity()).isEqualTo(5);
        assertThat(violetta.getQuantity()).isEqualTo(10);
        assertThat(basket.getStatus()).isEqualTo(BasketStatus.DRAFT);
        verify(mockEventPublisher, never()).publish(any());
    }

    @Test
    void shouldUpdateAndSaveADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                // rosa is removed
                new BasketItemCommandDTO(violetta.getAccession(), 10)
            ),
            new CustomerCommandDTO(
                "Jack",
                "jack@mail.com",
                "21 Jump street",
                CustomerType.BIOLOGIST,
                SupportedLanguage.ENGLISH
            ),
            "because...",
            true
        );

        mockMvc.perform(put("/api/baskets/{reference}", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(basket.getItems()).containsOnly(violetta);
        assertThat(violetta.getQuantity()).isEqualTo(10);
        assertThat(violetta.getAccessionHolder()).isEqualTo(alice);
        assertThat(basket.getStatus()).isEqualTo(BasketStatus.SAVED);
        assertThat(basket.getCustomer()).isEqualTo(new Customer(command.getCustomer().getName(),
                                                                command.getCustomer().getEmail(),
                                                                command.getCustomer().getAddress(),
                                                                command.getCustomer().getType(),
                                                                command.getCustomer().getLanguage()));
        assertThat(basket.getRationale()).isEqualTo(command.getRationale());
        verify(mockEventPublisher).publish(new BasketSaved(basket.getId()));
    }

    @Test
    void shouldThrowWhenConfirmingNonSavedBasket() throws Exception {
        BasketConfirmationCommandDTO command = new BasketConfirmationCommandDTO("ZYXWVUTS");

        basket.setStatus(BasketStatus.DRAFT);
        checkBadRequestWhenConfirming(command);

        basket.setStatus(BasketStatus.CONFIRMED);
        checkBadRequestWhenConfirming(command);
    }

    @Test
    void shouldThrowWhenConfirmingWithBadCode() throws Exception {
        BasketConfirmationCommandDTO command = new BasketConfirmationCommandDTO("ZYXWVUTS");

        basket.setStatus(BasketStatus.SAVED);
        basket.setConfirmationCode("OTHER");
        checkBadRequestWhenConfirming(command);
    }

    @Test
    void shouldConfirm() throws Exception {
        BasketConfirmationCommandDTO command = new BasketConfirmationCommandDTO("ZYXWVUTS");

        rosa.setQuantity(1);
        violetta.setQuantity(2);
        basket.setStatus(BasketStatus.SAVED);
        basket.setConfirmationCode(command.getConfirmationCode());

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        AtomicLong counter = new AtomicLong(1L);
        when(mockOrderDao.save(any())).thenAnswer(MoreAnswers.<Order>firstArgWith(o -> o.setId(counter.getAndIncrement())));

        mockMvc.perform(put("/api/baskets/{reference}/confirmation", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(basket.getStatus()).isEqualTo(BasketStatus.CONFIRMED);
        assertThat(basket.getConfirmationInstant()).isNotNull();

        verify(mockOrderDao, times(2)).save(orderCaptor.capture());

        Order johnsOrder = orderCaptor.getAllValues().stream().filter(order -> order.getAccessionHolder().equals(john)).findAny().get();
        Order alicesOrder = orderCaptor.getAllValues().stream().filter(order -> order.getAccessionHolder().equals(alice)).findAny().get();
        assertThat(johnsOrder.getBasket()).isEqualTo(basket);
        assertThat(johnsOrder.getStatus()).isEqualTo(OrderStatus.DRAFT);
        assertThat(johnsOrder.getItems())
            .extracting(OrderItem::getOrder, OrderItem::getAccession, OrderItem::getQuantity)
            .containsOnly(Tuple.tuple(johnsOrder, rosa.getAccession(), rosa.getQuantity()));

        verify(mockEventPublisher).publish(new OrderCreated(johnsOrder.getId()));
        verify(mockEventPublisher).publish(new OrderCreated(alicesOrder.getId()));
    }

    private void checkBadRequestWhenCreating(BasketCommandDTO command) throws Exception {
        mockMvc.perform(post("/api/baskets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    private void checkBadRequestWhenUpdating(BasketCommandDTO command) throws Exception {
        mockMvc.perform(put("/api/baskets/{reference}", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }

    private void checkBadRequestWhenConfirming(BasketConfirmationCommandDTO command) throws Exception {
        mockMvc.perform(put("/api/baskets/{reference}/confirmation", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }
}
