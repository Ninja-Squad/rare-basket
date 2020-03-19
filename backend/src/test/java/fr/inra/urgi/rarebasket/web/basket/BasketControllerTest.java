package fr.inra.urgi.rarebasket.web.basket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldNotCreateEmptyBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(Collections.emptyList());
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithInvalidEmail() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            Collections.singletonList(new BasketItemCommandDTO("rosa", "notAnEmail"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithBlankAccession() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            Collections.singletonList(new BasketItemCommandDTO("", "john@mail.com"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldNotCreateBasketWithItemWithUnexistingContact() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            Collections.singletonList(new BasketItemCommandDTO("rosa", "john@mail.com"))
        );
        checkBadRequestWhenCreating(command);
    }

    @Test
    void shouldCreateADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(
            Arrays.asList(
                new BasketItemCommandDTO("rosa", "john@mail.com"),
                new BasketItemCommandDTO("violetta", "john@mail.com"),
                new BasketItemCommandDTO("amanita", "alice@mail.com")
            )
        );

        GrcContact john = new GrcContact();
        GrcContact jack = new GrcContact();
        when(mockGrcContactDao.findByEmail("john@mail.com")).thenReturn(Optional.of(john));
        when(mockGrcContactDao.findByEmail("alice@mail.com")).thenReturn(Optional.of(jack));

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
                tuple("amanita", jack, savedBasket)
            );
    }

    @Test
    void shouldGet() throws Exception {
        Basket basket = new Basket(42L);
        basket.setReference("ref");
        basket.setStatus(BasketStatus.DRAFT);
        basket.setCustomer(new Customer("jb", "jb@mail.com", "Saint Just", CustomerType.FARMER));
        basket.setRationale("why not?");
        BasketItem rosa = new BasketItem(5L);
        rosa.setAccession("rosa");
        rosa.setQuantity(2);
        basket.addItem(rosa);

        BasketItem violetta = new BasketItem(3L);
        violetta.setAccession("violetta");
        violetta.setQuantity(null);
        basket.addItem(violetta);
        when(mockBasketDao.findByReference(basket.getReference())).thenReturn(Optional.of(basket));

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

    private void checkBadRequestWhenCreating(BasketCommandDTO command) throws Exception {
        mockMvc.perform(post("/api/baskets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isBadRequest());
    }
}
