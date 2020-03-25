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

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.dao.GrcContactDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketItem;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import fr.inra.urgi.rarebasket.domain.Customer;
import fr.inra.urgi.rarebasket.domain.CustomerType;
import fr.inra.urgi.rarebasket.domain.GrcContact;
import fr.inra.urgi.rarebasket.service.event.BasketSaved;
import fr.inra.urgi.rarebasket.service.event.EventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests for BasketController
 * @author JB Nizet
 */
@WebMvcTest(BasketController.class)
class BasketControllerTest {

    @MockBean
    private BasketDao mockBasketDao;

    @MockBean
    private GrcContactDao mockGrcContactDao;

    @MockBean
    private EventPublisher mockEventPublisher;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Basket basket;
    private BasketItem rosa;
    private BasketItem violetta;

    private GrcContact john;
    private GrcContact alice;

    @BeforeEach
    void prepare() {
        john = new GrcContact(1L);
        john.setEmail("john@mail.com");
        alice = new GrcContact(2L);
        alice.setEmail("alice@mail.com");

        List.of(john, alice).forEach(
            contact -> when(mockGrcContactDao.findByEmail(contact.getEmail())).thenReturn(Optional.of(contact))
        );

        basket = new Basket(42L);
        basket.setReference("ref");
        basket.setStatus(BasketStatus.DRAFT);
        basket.setCustomer(new Customer("jb", "jb@mail.com", "Saint Just", CustomerType.FARMER));
        basket.setRationale("why not?");

        rosa = new BasketItem(5L);
        rosa.setAccession("rosa");
        rosa.setQuantity(2);
        rosa.setContact(john);
        basket.addItem(rosa);

        violetta = new BasketItem(3L);
        violetta.setAccession("violetta");
        violetta.setQuantity(null);
        violetta.setContact(alice);
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
            List.of(new BasketItemCommandDTO("rosa", "notAnEmail"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithBlankAccession() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("", john.getEmail()))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithUnexistingContact() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", "unexisting@mail.com"))
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
                CustomerType.FARMER
            );

        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", john.getEmail())),
            customer,
            "rationale",
            false
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithInvalidQuantity() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", john.getEmail(), 0))
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
                CustomerType.FARMER
            ),
            new CustomerCommandDTO(
                "validName",
                null,
                "address",
                CustomerType.FARMER
            ),
            new CustomerCommandDTO(
                "validName",
                "notAnEmail",
                "address",
                CustomerType.FARMER
            ),
            new CustomerCommandDTO(
                "validName",
                "foo@bar.com",
                "",
                CustomerType.FARMER
            ),
            new CustomerCommandDTO(
                "validName",
                "foo@bar.com",
                "",
                null
            )
        );
        for (CustomerCommandDTO customer : invalidCustomers) {
            BasketCommandDTO command = new BasketCommandDTO(
                List.of(new BasketItemCommandDTO("rosa", john.getEmail())),
                customer,
                "rationale",
                true
            );
            checkBadRequestWhenCreating(command);
        }
    }

    @Test
    void shouldNotCreateCompleteBasketWithIncompleteQuantities() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", john.getEmail())),
            new CustomerCommandDTO(
                "Jack",
                "jack@mail.com",
                "21 Jump street",
                CustomerType.BIOLOGIST
            ),
            "rationale",
            true
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldCreateADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                new BasketItemCommandDTO("rosa", john.getEmail()),
                new BasketItemCommandDTO("violetta", john.getEmail()),
                new BasketItemCommandDTO("amanita", alice.getEmail())
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
            .extracting(BasketItem::getAccession, BasketItem::getContact, BasketItem::getBasket)
            .containsOnly(
                tuple("rosa", john, savedBasket),
                tuple("violetta", john, savedBasket),
                tuple("amanita", alice, savedBasket)
            );

        verify(mockEventPublisher, never()).publish(any());
    }

    @Test
    void shouldCreateACompleteBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(
                new BasketItemCommandDTO("rosa", john.getEmail(), 1),
                new BasketItemCommandDTO("violetta", john.getEmail(), 2),
                new BasketItemCommandDTO("amanita", alice.getEmail(), 3)
            ),
            new CustomerCommandDTO(
                "Jack",
                "jack@mail.com",
                "21 Jump street",
                CustomerType.BIOLOGIST
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
            .extracting(BasketItem::getAccession, BasketItem::getContact, BasketItem::getQuantity, BasketItem::getBasket)
            .containsOnly(
                tuple("rosa", john, 1, savedBasket),
                tuple("violetta", john, 2, savedBasket),
                tuple("amanita", alice, 3, savedBasket)
            );
        assertThat(savedBasket.getStatus()).isEqualTo(BasketStatus.SAVED);
        assertThat(savedBasket.getCustomer()).isEqualTo(new Customer(command.getCustomer().getName(),
                                                                     command.getCustomer().getEmail(),
                                                                     command.getCustomer().getAddress(),
                                                                     command.getCustomer().getType()));
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
               .andExpect(jsonPath("$.items.length()").value(2))
               .andExpect(jsonPath("$.items[0].id").value(rosa.getId()))
               .andExpect(jsonPath("$.items[0].accession").value(rosa.getAccession()))
               .andExpect(jsonPath("$.items[0].quantity").value(rosa.getQuantity()))
               .andExpect(jsonPath("$.items[1].id").value(violetta.getId()))
               .andExpect(jsonPath("$.items[1].quantity").isEmpty());
    }

    @Test
    void shouldNotUpdateANonDraftBasket() throws Exception {
        basket.setStatus(BasketStatus.SAVED);

        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", 5))
        );
        checkBadRequestWhenUpdating(command);
    }

    @Test
    void shouldNotUpdateADraftBasketWithContactEmails() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            List.of(new BasketItemCommandDTO("rosa", "john@mail.com"))
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
                CustomerType.BIOLOGIST
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
        assertThat(violetta.getContact()).isEqualTo(alice);
        assertThat(basket.getStatus()).isEqualTo(BasketStatus.SAVED);
        assertThat(basket.getCustomer()).isEqualTo(new Customer(command.getCustomer().getName(),
                                                                command.getCustomer().getEmail(),
                                                                command.getCustomer().getAddress(),
                                                                command.getCustomer().getType()));
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

        basket.setStatus(BasketStatus.SAVED);
        basket.setConfirmationCode(command.getConfirmationCode());

        mockMvc.perform(put("/api/baskets/{reference}/confirmation", basket.getReference())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isNoContent());

        assertThat(basket.getStatus()).isEqualTo(BasketStatus.CONFIRMED);
        assertThat(basket.getConfirmationInstant()).isNotNull();
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
