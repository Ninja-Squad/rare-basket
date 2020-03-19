package fr.inra.urgi.rarebasket.web.basket;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.inra.urgi.rarebasket.MoreAnswers;
import fr.inra.urgi.rarebasket.dao.BasketDao;
import fr.inra.urgi.rarebasket.domain.Basket;
import fr.inra.urgi.rarebasket.domain.BasketStatus;
import org.junit.jupiter.api.Test;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateADraftBasket() throws Exception {
        BasketCommandDTO command = new BasketCommandDTO(null);

        when(mockBasketDao.save(any())).thenAnswer(MoreAnswers.<Basket>firstArgWith(b -> b.setId(42L)));

        mockMvc.perform(post("/api/baskets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsBytes(command)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(42L))
               .andExpect(jsonPath("$.reference").isNotEmpty())
               .andExpect(jsonPath("$.status").value(BasketStatus.DRAFT.name()));

        verify(mockBasketDao).save(any());
    }

    @Test
    void shouldGet() throws Exception {
        Basket basket = new Basket(42L);
        basket.setReference("ref");
        basket.setStatus(BasketStatus.DRAFT);
        when(mockBasketDao.findById(basket.getId())).thenReturn(Optional.of(basket));

        mockMvc.perform(get("/api/baskets/{id}", basket.getId()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(basket.getId()))
               .andExpect(jsonPath("$.reference").value(basket.getReference()))
               .andExpect(jsonPath("$.status").value(BasketStatus.DRAFT.name()));
    }
}
